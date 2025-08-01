import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from typing import Optional, Dict, Any
from database import get_collection, to_object_id
from models import TokenResponse
import secrets
import logging

from config import settings
from exceptions import (
    InvalidCredentialsException,
    InactiveUserException,
    UserNotFoundException,
    RestaurantNotFoundException,
    TokenExpiredException,
    InvalidTokenException,
    UserAlreadyExistsException,
    PasswordMismatchException
)

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.secret_key = settings.jwt_secret_key
        self.algorithm = "HS256"
        self.access_token_expire_minutes = settings.access_token_expire_minutes
        self.refresh_token_expire_days = settings.refresh_token_expire_days
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # In-memory store for refresh tokens (en producción usar Redis o MongoDB)
        self.refresh_tokens: Dict[str, Dict] = {}

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def create_access_token(self, data: Dict[Any, Any]) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire, "type": "access"})
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def create_refresh_token(self, user_id: str, restaurant_slug: str) -> str:
        """Create refresh token"""
        token = secrets.token_urlsafe(32)
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        
        self.refresh_tokens[token] = {
            "user_id": user_id,
            "restaurant_slug": restaurant_slug,
            "expires_at": expire
        }
        
        return token

    def verify_refresh_token(self, token: str) -> Optional[Dict]:
        """Verify refresh token"""
        token_data = self.refresh_tokens.get(token)
        if not token_data:
            return None
            
        if datetime.utcnow() > token_data["expires_at"]:
            # Token expired, remove it
            del self.refresh_tokens[token]
            return None
            
        return token_data

    def revoke_refresh_token(self, token: str):
        """Revoke refresh token"""
        if token in self.refresh_tokens:
            del self.refresh_tokens[token]

    async def verify_token(self, token: str) -> Dict:
        """Verify JWT access token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            if payload.get("type") != "access":
                raise InvalidTokenException()
                
            user_id = payload.get("user_id")
            
            if not user_id:
                raise InvalidTokenException()
                
            # Get user from database
            users_collection = get_collection("users")
            user = await users_collection.find_one({"_id": to_object_id(user_id)})
            
            if not user:
                raise UserNotFoundException()
            
            if not user.get("is_active"):
                raise InactiveUserException()
                
            return {
                "user_id": str(user["_id"]),
                "username": user["username"],
                "role": user["role"],
                "restaurant_slug": user.get("restaurant_slug"),
                "restaurant_id": str(user.get("restaurant_id")) if user.get("restaurant_id") else None
            }
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            raise TokenExpiredException()
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            raise InvalidTokenException()

    async def authenticate_user(self, username: str, password: str, restaurant_slug: str) -> TokenResponse:
        """Authenticate user and return tokens"""
        users_collection = get_collection("users")
        
        # Find user by username and restaurant
        query = {
            "username": username,
            "restaurant_slug": restaurant_slug,
            "is_active": True
        }
        
        user = await users_collection.find_one(query)
        
        if not user:
            logger.warning(f"User not found: {username}@{restaurant_slug}")
            raise InvalidCredentialsException()
            
        if not self.verify_password(password, user["password_hash"]):
            logger.warning(f"Invalid password for user: {username}@{restaurant_slug}")
            raise InvalidCredentialsException()
            
        # Get restaurant info
        restaurants_collection = get_collection("restaurants")
        restaurant = await restaurants_collection.find_one({
            "slug": restaurant_slug,
            "is_active": True
        })
        
        if not restaurant:
            logger.warning(f"Restaurant not found or inactive: {restaurant_slug}")
            raise RestaurantNotFoundException()
            
        # Create tokens
        user_id = str(user["_id"])
        token_data = {
            "user_id": user_id,
            "username": user["username"],
            "role": user["role"],
            "restaurant_slug": restaurant_slug,
            "restaurant_id": str(user.get("restaurant_id")) if user.get("restaurant_id") else None
        }
        
        access_token = self.create_access_token(token_data)
        refresh_token = self.create_refresh_token(user_id, restaurant_slug)
        
        # Update last login
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=self.access_token_expire_minutes * 60,
            user={
                "id": user_id,
                "username": user["username"],
                "role": user["role"],
                "restaurant_slug": restaurant_slug,
                "restaurant_name": restaurant["name"]
            }
        )

    async def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """Create new access token using refresh token"""
        token_data = self.verify_refresh_token(refresh_token)
        if not token_data:
            raise InvalidTokenException()
            
        # Get user from database
        users_collection = get_collection("users")
        user = await users_collection.find_one({
            "_id": to_object_id(token_data["user_id"]),
            "is_active": True
        })
        
        if not user:
            raise UserNotFoundException()
            
        # Get restaurant info
        restaurants_collection = get_collection("restaurants")
        restaurant = await restaurants_collection.find_one({
            "slug": token_data["restaurant_slug"],
            "is_active": True
        })
        
        if not restaurant:
            raise RestaurantNotFoundException()
            
        # Create new access token
        new_token_data = {
            "user_id": str(user["_id"]),
            "username": user["username"],
            "role": user["role"],
            "restaurant_slug": token_data["restaurant_slug"],
            "restaurant_id": str(user.get("restaurant_id")) if user.get("restaurant_id") else None
        }
        
        access_token = self.create_access_token(new_token_data)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,  # Keep same refresh token
            expires_in=self.access_token_expire_minutes * 60,
            user={
                "id": str(user["_id"]),
                "username": user["username"],
                "role": user["role"],
                "restaurant_slug": token_data["restaurant_slug"],
                "restaurant_name": restaurant["name"]
            }
        )

    async def create_user(self, username: str, password: str, restaurant_slug: str, role: str = "admin", email: Optional[str] = None) -> str:
        """Create new user account"""
        users_collection = get_collection("users")
        restaurants_collection = get_collection("restaurants")
        
        # Check if restaurant exists
        restaurant = await restaurants_collection.find_one({"slug": restaurant_slug})
        if not restaurant:
            raise RestaurantNotFoundException()
            
        # Check if user already exists
        existing_user = await users_collection.find_one({
            "username": username,
            "restaurant_slug": restaurant_slug
        })
        
        if existing_user:
            raise UserAlreadyExistsException()
            
        # Create user
        user_data = {
            "username": username,
            "password_hash": self.hash_password(password),
            "role": role,
            "restaurant_id": restaurant["_id"],
            "restaurant_slug": restaurant_slug,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        if email:
            user_data["email"] = email
        
        result = await users_collection.insert_one(user_data)
        logger.info(f"User created: {username}@{restaurant_slug}")
        
        return str(result.inserted_id)

    async def change_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        """Change user password"""
        users_collection = get_collection("users")
        
        user = await users_collection.find_one({"_id": to_object_id(user_id)})
        if not user:
            raise UserNotFoundException()
            
        if not self.verify_password(old_password, user["password_hash"]):
            raise PasswordMismatchException()
            
        new_hash = self.hash_password(new_password)
        
        await users_collection.update_one(
            {"_id": to_object_id(user_id)},
            {
                "$set": {
                    "password_hash": new_hash,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        logger.info(f"Password changed for user: {user_id}")
        return True

    async def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user account"""
        users_collection = get_collection("users")
        
        result = await users_collection.update_one(
            {"_id": to_object_id(user_id)},
            {
                "$set": {
                    "is_active": False,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return result.modified_count > 0

    def cleanup_expired_tokens(self):
        """Remove expired refresh tokens"""
        current_time = datetime.utcnow()
        expired_tokens = [
            token for token, data in self.refresh_tokens.items()
            if current_time > data["expires_at"]
        ]
        
        for token in expired_tokens:
            del self.refresh_tokens[token]
            
        if expired_tokens:
            logger.info(f"Cleaned up {len(expired_tokens)} expired refresh tokens")