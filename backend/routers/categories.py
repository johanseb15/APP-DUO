from fastapi import APIRouter, Depends, HTTPException, status, Request
from models import CategoryResponse, CategoryCreate, CategoryUpdate
from typing import List
from dependencies import get_current_user

router = APIRouter()

@router.get("/api/{slug}/categories", response_model=List[CategoryResponse])
async def get_categories(request: Request, slug: str):
    """Obtener categorías del restaurante"""
    categories = await request.app.state.category_service.get_categories_by_restaurant(slug)
    return categories

@router.post("/api/{slug}/categories", response_model=CategoryResponse)
async def create_category(
    request: Request,
    slug: str,
    category_data: CategoryCreate,
    current_user: dict = Depends(get_current_user)
):
    """Crear nueva categoría"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para este restaurante"
        )
    
    category = await request.app.state.category_service.create_category(slug, category_data)
    return category

@router.put("/api/{slug}/categories/{category_id}")
async def update_category(
    request: Request,
    slug: str,
    category_id: str,
    category_data: CategoryUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar categoría"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    updated = await request.app.state.category_service.update_category(category_id, category_data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"message": "Categoría actualizada"}

@router.delete("/api/{slug}/categories/{category_id}")
async def delete_category(
    request: Request,
    slug: str,
    category_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Eliminar categoría"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    deleted = await request.app.state.category_service.delete_category(category_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"message": "Categoría eliminada"}
