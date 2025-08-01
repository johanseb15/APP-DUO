from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from typing import Optional, List
import os
from dotenv import load_dotenv
from config import settings
from exceptions import InvalidCredentialsException, TokenExpiredException, InvalidTokenException, UserNotFoundException, RestaurantNotFoundException, UserAlreadyExistsException, PasswordMismatchException, InactiveUserException

# Import modules
from database import database, init_db, close_db
from models import *
from auth import AuthService
from services import RestaurantService, ProductService, OrderService, CategoryService, PushNotificationService
from dependencies import get_current_user

# Import routers
from routers import auth, restaurants, categories, products, orders, analytics, push_notifications, initialization, public_routes

load_dotenv()

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    app.state.auth_service = AuthService()
    app.state.restaurant_service = RestaurantService()
    app.state.product_service = ProductService()
    app.state.order_service = OrderService()
    app.state.category_service = CategoryService()
    app.state.push_notification_service = PushNotificationService()
    yield
    # Shutdown
    await close_db()

app = FastAPI(
    title="Food Delivery Multi-Tenant API",
    description="API para plataforma de pedidos multi-inquilino",
    version="1.0.0",
    lifespan=lifespan
)

@app.exception_handler(InvalidCredentialsException)
async def invalid_credentials_exception_handler(request: Request, exc: InvalidCredentialsException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers
    )

@app.exception_handler(InactiveUserException)
async def inactive_user_exception_handler(request: Request, exc: InactiveUserException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(UserNotFoundException)
async def user_not_found_exception_handler(request: Request, exc: UserNotFoundException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(RestaurantNotFoundException)
async def restaurant_not_found_exception_handler(request: Request, exc: RestaurantNotFoundException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(TokenExpiredException)
async def token_expired_exception_handler(request: Request, exc: TokenExpiredException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers
    )

@app.exception_handler(InvalidTokenException)
async def invalid_token_exception_handler(request: Request, exc: InvalidTokenException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers
    )

@app.exception_handler(UserAlreadyExistsException)
async def user_already_exists_exception_handler(request: Request, exc: UserAlreadyExistsException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(PasswordMismatchException)
async def password_mismatch_exception_handler(request: Request, exc: PasswordMismatchException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# CORS middleware

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Usar orígenes de configuración
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(restaurants.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(push_notifications.router)
app.include_router(initialization.router)
app.include_router(public_routes.router)

# Root endpoint
@app.get("/")
async def root():
    return {"status": "Food Delivery API Running", "version": "1.0.0"}

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
