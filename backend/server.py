from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

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
    status: str = "pending"  # pending, confirmed, preparing, delivered
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    items: List[CartItem]
    total: float
    customer_name: str
    customer_phone: str
    delivery_zone: str
    delivery_address: str
    special_instructions: Optional[str] = ""

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

# Menu endpoints
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

# Delivery zones endpoints
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

# Order endpoints
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
    
    return {"message": "Sample data initialized successfully"}

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