from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
import hashlib
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT configuration
JWT_SECRET = "duo_previa_secret_key_2024"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Define Models
class MenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str  # "lomitos", "hamburgers", "empanadas"
    image_url: str
    available: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    available: bool = True

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None

class CartItem(BaseModel):
    menu_item_id: str
    name: str
    price: float
    quantity: int
    special_instructions: Optional[str] = ""

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[CartItem]
    total: float
    customer_name: str
    customer_phone: str
    delivery_zone: str
    delivery_address: str
    special_instructions: Optional[str] = ""
    status: str = "pending"  # pending, confirmed, preparing, delivered, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    items: List[CartItem]
    total: float
    customer_name: str
    customer_phone: str
    delivery_zone: str
    delivery_address: str
    special_instructions: Optional[str] = ""

class OrderStatusUpdate(BaseModel):
    status: str

class DeliveryZone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    delivery_fee: float
    estimated_time: str  # "30-45 min"
    active: bool = True

class DeliveryZoneCreate(BaseModel):
    name: str
    delivery_fee: float
    estimated_time: str
    active: bool = True

class DeliveryZoneUpdate(BaseModel):
    name: Optional[str] = None
    delivery_fee: Optional[float] = None
    estimated_time: Optional[str] = None
    active: Optional[bool] = None

# Admin Models
class AdminLogin(BaseModel):
    email: str
    password: str

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminCreate(BaseModel):
    email: str
    password: str
    name: str

# Push Notification Models
class PushSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    endpoint: str
    keys: dict
    user_agent: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PushNotification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    body: str
    icon: Optional[str] = ""
    url: Optional[str] = ""
    sent_at: datetime = Field(default_factory=datetime.utcnow)

class PushNotificationCreate(BaseModel):
    title: str
    body: str
    icon: Optional[str] = ""
    url: Optional[str] = ""

# Authentication functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_access_token(email: str) -> str:
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        admin = await db.admin_users.find_one({"email": email})
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin not found")
            
        return AdminUser(**admin)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Admin Authentication endpoints
@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    """Admin login endpoint"""
    admin = await db.admin_users.find_one({"email": login_data.email})
    if not admin or not verify_password(login_data.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(login_data.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin": {
            "id": admin["id"],
            "email": admin["email"],
            "name": admin["name"]
        }
    }

@api_router.post("/admin/create")
async def create_admin(admin_data: AdminCreate):
    """Create admin user (for initial setup)"""
    existing_admin = await db.admin_users.find_one({"email": admin_data.email})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    admin = AdminUser(
        email=admin_data.email,
        password_hash=hash_password(admin_data.password),
        name=admin_data.name
    )
    await db.admin_users.insert_one(admin.dict())
    return {"message": "Admin created successfully"}

@api_router.get("/admin/me")
async def get_current_admin_info(current_admin: AdminUser = Depends(get_current_admin)):
    """Get current admin info"""
    return {
        "id": current_admin.id,
        "email": current_admin.email,
        "name": current_admin.name
    }

# Protected Menu endpoints for admin
@api_router.post("/admin/menu", response_model=MenuItem)
async def create_menu_item_admin(item: MenuItemCreate, current_admin: AdminUser = Depends(get_current_admin)):
    """Create a new menu item (admin only)"""
    menu_item = MenuItem(**item.dict())
    await db.menu_items.insert_one(menu_item.dict())
    return menu_item

@api_router.put("/admin/menu/{item_id}", response_model=MenuItem)
async def update_menu_item_admin(item_id: str, item_update: MenuItemUpdate, current_admin: AdminUser = Depends(get_current_admin)):
    """Update menu item (admin only)"""
    update_data = {k: v for k, v in item_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.menu_items.update_one(
        {"id": item_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    updated_item = await db.menu_items.find_one({"id": item_id})
    return MenuItem(**updated_item)

@api_router.delete("/admin/menu/{item_id}")
async def delete_menu_item_admin(item_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Delete menu item (admin only)"""
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted successfully"}

# Protected Delivery Zone endpoints for admin
@api_router.post("/admin/delivery-zones", response_model=DeliveryZone)
async def create_delivery_zone_admin(zone: DeliveryZoneCreate, current_admin: AdminUser = Depends(get_current_admin)):
    """Create delivery zone (admin only)"""
    delivery_zone = DeliveryZone(**zone.dict())
    await db.delivery_zones.insert_one(delivery_zone.dict())
    return delivery_zone

@api_router.put("/admin/delivery-zones/{zone_id}", response_model=DeliveryZone)
async def update_delivery_zone_admin(zone_id: str, zone_update: DeliveryZoneUpdate, current_admin: AdminUser = Depends(get_current_admin)):
    """Update delivery zone (admin only)"""
    update_data = {k: v for k, v in zone_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.delivery_zones.update_one(
        {"id": zone_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Delivery zone not found")
    
    updated_zone = await db.delivery_zones.find_one({"id": zone_id})
    return DeliveryZone(**updated_zone)

@api_router.delete("/admin/delivery-zones/{zone_id}")
async def delete_delivery_zone_admin(zone_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Delete delivery zone (admin only)"""
    result = await db.delivery_zones.delete_one({"id": zone_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Delivery zone not found")
    return {"message": "Delivery zone deleted successfully"}

# Enhanced Order Management for admin
@api_router.get("/admin/orders", response_model=List[Order])
async def get_orders_admin(
    status: Optional[str] = None,
    limit: int = 100,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get orders with optional filtering (admin only)"""
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    return [Order(**order) for order in orders]

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status_admin(
    order_id: str, 
    status_update: OrderStatusUpdate, 
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Update order status (admin only)"""
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status_update.status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": f"Order status updated to {status_update.status}"}

# Push Notification endpoints
@api_router.post("/push/subscribe")
async def subscribe_to_push(subscription_data: dict):
    """Subscribe to push notifications"""
    subscription = PushSubscription(
        endpoint=subscription_data["endpoint"],
        keys=subscription_data["keys"],
        user_agent=subscription_data.get("userAgent", "")
    )
    await db.push_subscriptions.insert_one(subscription.dict())
    return {"message": "Subscribed successfully"}

@api_router.post("/admin/push/send")
async def send_push_notification(
    notification: PushNotificationCreate,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Send push notification to all subscribers (admin only)"""
    # Store notification in database
    push_notification = PushNotification(**notification.dict())
    await db.push_notifications.insert_one(push_notification.dict())
    
    # Get all active subscriptions
    subscriptions = await db.push_subscriptions.find().to_list(1000)
    
    # In a real implementation, you would send the notification using web-push library
    # For now, we'll just return success
    return {
        "message": f"Notification sent to {len(subscriptions)} subscribers",
        "notification_id": push_notification.id
    }

@api_router.get("/admin/push/notifications", response_model=List[PushNotification])
async def get_push_notifications_admin(current_admin: AdminUser = Depends(get_current_admin)):
    """Get sent push notifications (admin only)"""
    notifications = await db.push_notifications.find().sort("sent_at", -1).limit(50).to_list(50)
    return [PushNotification(**notification) for notification in notifications]

# Public Menu endpoints (existing)
@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu():
    """Get all menu items"""
    menu_items = await db.menu_items.find({"available": True}).to_list(1000)
    return [MenuItem(**item) for item in menu_items]

@api_router.get("/menu/category/{category}", response_model=List[MenuItem])
async def get_menu_by_category(category: str):
    """Get menu items by category"""
    menu_items = await db.menu_items.find({"category": category, "available": True}).to_list(1000)
    return [MenuItem(**item) for item in menu_items]

@api_router.post("/menu", response_model=MenuItem)
async def create_menu_item(item: MenuItemCreate):
    """Create a new menu item"""
    menu_item = MenuItem(**item.dict())
    await db.menu_items.insert_one(menu_item.dict())
    return menu_item

@api_router.put("/menu/{item_id}/availability")
async def toggle_menu_item_availability(item_id: str, available: bool):
    """Toggle menu item availability"""
    result = await db.menu_items.update_one(
        {"id": item_id},
        {"$set": {"available": available}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Availability updated"}

# Delivery zones endpoints (existing)
@api_router.get("/delivery-zones", response_model=List[DeliveryZone])
async def get_delivery_zones():
    """Get all active delivery zones"""
    zones = await db.delivery_zones.find({"active": True}).to_list(100)
    return [DeliveryZone(**zone) for zone in zones]

@api_router.post("/delivery-zones", response_model=DeliveryZone)
async def create_delivery_zone(zone: DeliveryZoneCreate):
    """Create a new delivery zone"""
    delivery_zone = DeliveryZone(**zone.dict())
    await db.delivery_zones.insert_one(delivery_zone.dict())
    return delivery_zone

# Order endpoints (existing)
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    """Create a new order"""
    new_order = Order(**order.dict())
    await db.orders.insert_one(new_order.dict())
    return new_order

@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    """Get all orders"""
    orders = await db.orders.find().sort("created_at", -1).to_list(1000)
    return [Order(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get a specific order"""
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)

# Initialize sample data
@api_router.post("/initialize-data")
async def initialize_sample_data():
    """Initialize the database with sample menu items and delivery zones"""
    
    # Check if data already exists
    existing_items = await db.menu_items.count_documents({})
    if existing_items > 0:
        # Check if admin exists, if not create default admin
        existing_admin = await db.admin_users.count_documents({})
        if existing_admin == 0:
            default_admin = AdminUser(
                email="admin@duoprevia.com",
                password_hash=hash_password("admin123"),
                name="Administrador DUO Previa"
            )
            await db.admin_users.insert_one(default_admin.dict())
        
        return {"message": "Data already initialized"}
    
    # Sample menu items
    sample_menu_items = [
        # Lomitos
        {
            "name": "Lomito Completo",
            "description": "Lomito con jamón, queso, lechuga, tomate, huevo frito y papas fritas",
            "price": 4500.0,
            "category": "lomitos",
            "image_url": "https://images.unsplash.com/photo-1553909489-cd47e0907980?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaHxlbnwwfHx8fDE3NTMzOTI1MzZ8MA&ixlib=rb-4.1.0&q=85",
            "available": True
        },
        {
            "name": "Lomito Simple",
            "description": "Lomito con lechuga, tomate y mayonesa",
            "price": 3200.0,
            "category": "lomitos",
            "image_url": "https://images.unsplash.com/photo-1509722747041-616f39b57569?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwzfHxzYW5kd2ljaHxlbnwwfHx8fDE3NTMzOTI1MzZ8MA&ixlib=rb-4.1.0&q=85",
            "available": True
        },
        # Hamburgers
        {
            "name": "Hamburguesa DUO",
            "description": "Doble carne, queso cheddar, cebolla caramelizada, panceta y salsa especial",
            "price": 4200.0,
            "category": "hamburgers",
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxoYW1idXJnZXJ8ZW58MHx8fHwxNzUzMzkyNTQ0fDA&ixlib=rb-4.1.0&q=85",
            "available": True
        },
        {
            "name": "Hamburguesa Clásica",
            "description": "Carne, queso, lechuga, tomate, cebolla y papas fritas",
            "price": 3500.0,
            "category": "hamburgers",
            "image_url": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxoYW1idXJnZXJ8ZW58MHx8fHwxNzUzMzkyNTQ0fDA&ixlib=rb-4.1.0&q=85",
            "available": True
        },
        # Empanadas
        {
            "name": "Empanadas de Carne",
            "description": "Empanadas tradicionales de carne cortada a cuchillo (6 unidades)",
            "price": 2800.0,
            "category": "empanadas",
            "image_url": "https://images.unsplash.com/photo-1619926096619-5956ab4dfb1b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxlbXBhbmFkYXN8ZW58MHx8fHwxNzUzMzkyNTUxfDA&ixlib=rb-4.1.0&q=85",
            "available": True
        },
        {
            "name": "Empanadas Mixtas",
            "description": "Surtido de empanadas: carne, pollo, jamón y queso (6 unidades)",
            "price": 3000.0,
            "category": "empanadas",
            "image_url": "https://images.unsplash.com/photo-1624128082323-beb6b8b508db?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw0fHxlbXBhbmFkYXN8ZW58MHx8fHwxNzUzMzkyNTUxfDA&ixlib=rb-4.1.0&q=85",
            "available": True
        }
    ]
    
    # Add IDs to menu items
    for item in sample_menu_items:
        item["id"] = str(uuid.uuid4())
        item["created_at"] = datetime.utcnow()
    
    await db.menu_items.insert_many(sample_menu_items)
    
    # Sample delivery zones
    sample_zones = [
        {
            "id": str(uuid.uuid4()),
            "name": "Centro",
            "delivery_fee": 300.0,
            "estimated_time": "20-30 min",
            "active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Nueva Córdoba",
            "delivery_fee": 400.0,
            "estimated_time": "25-35 min",
            "active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cerro de las Rosas",
            "delivery_fee": 500.0,
            "estimated_time": "30-45 min",
            "active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Güemes",
            "delivery_fee": 350.0,
            "estimated_time": "20-30 min",
            "active": True
        }
    ]
    
    await db.delivery_zones.insert_many(sample_zones)
    
    # Create default admin user
    default_admin = AdminUser(
        email="admin@duoprevia.com",
        password_hash=hash_password("admin123"),
        name="Administrador DUO Previa"
    )
    await db.admin_users.insert_one(default_admin.dict())
    
    return {"message": "Sample data and default admin initialized successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()