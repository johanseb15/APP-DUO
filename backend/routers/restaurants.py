from fastapi import APIRouter, Depends, HTTPException, status, Request
from models import RestaurantResponse, RestaurantUpdate, RestaurantCreate
from typing import List
from dependencies import get_current_user

router = APIRouter()

@router.get("/api/restaurants/{slug}", response_model=RestaurantResponse)
async def get_restaurant_by_slug(request: Request, slug: str):
    """Obtener información del restaurante por slug"""
    restaurant = await request.app.state.restaurant_service.get_by_slug(slug)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurante no encontrado"
        )
    return restaurant

@router.put("/api/restaurants/{slug}")
async def update_restaurant(
    request: Request,
    slug: str,
    restaurant_data: RestaurantUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar configuración del restaurante"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para este restaurante"
        )
    
    updated = await request.app.state.restaurant_service.update_restaurant(slug, restaurant_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurante no encontrado"
        )
    return {"message": "Restaurante actualizado exitosamente"}

@router.post("/superadmin/restaurants", response_model=RestaurantResponse)
async def create_restaurant(
    request: Request,
    restaurant_data: RestaurantCreate,
    current_user: dict = Depends(get_current_user)
):
    """Crear nuevo restaurante (solo superadmin)"""
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    restaurant = await request.app.state.restaurant_service.create_restaurant(restaurant_data)
    return restaurant

@router.get("/superadmin/restaurants", response_model=List[RestaurantResponse])
async def get_all_restaurants(request: Request, current_user: dict = Depends(get_current_user)):
    """Obtener todos los restaurantes (solo superadmin)"""
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    restaurants = await request.app.state.restaurant_service.get_all_restaurants()
    return restaurants
