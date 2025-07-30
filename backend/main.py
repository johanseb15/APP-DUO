from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from typing import Optional, List
import os
from dotenv import load_dotenv

# Import modules
from database import database, init_db, close_db
from models import *
from auth import AuthService
from services import RestaurantService, ProductService, OrderService, CategoryService, PushNotificationService
from dependencies import get_current_user

# Import routers
from routers import auth, restaurants, categories, products, orders, analytics, push_notifications, initialization

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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción: dominios específicos
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
