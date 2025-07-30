from fastapi import APIRouter, Depends, HTTPException, status, Request
from models import ProductResponse, ProductCreate, ProductUpdate
from typing import List, Optional
from dependencies import get_current_user

router = APIRouter()

@router.get("/api/{slug}/products", response_model=List[ProductResponse])
async def get_products(
    request: Request,
    slug: str,
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    popular_only: bool = False
):
    """Obtener productos del restaurante"""
    products = await request.app.state.product_service.get_products_by_restaurant(
        slug, category_id, search, popular_only
    )
    return products

@router.get("/api/{slug}/products/{product_id}", response_model=ProductResponse)
async def get_product(request: Request, slug: str, product_id: str):
    """Obtener producto específico"""
    product = await request.app.state.product_service.get_product_by_id(product_id, slug)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    return product

@router.post("/api/{slug}/products", response_model=ProductResponse)
async def create_product(
    request: Request,
    slug: str,
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_user)
):
    """Crear nuevo producto"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para este restaurante"
        )
    
    product = await request.app.state.product_service.create_product(slug, product_data)
    return product

@router.put("/api/{slug}/products/{product_id}")
async def update_product(
    request: Request,
    slug: str,
    product_id: str,
    product_data: ProductUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar producto"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    updated = await request.app.state.product_service.update_product(product_id, product_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    return {"message": "Producto actualizado exitosamente"}

@router.delete("/api/{slug}/products/{product_id}")
async def delete_product(
    request: Request,
    slug: str,
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Eliminar producto"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    deleted = await request.app.state.product_service.delete_product(product_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"message": "Producto eliminado"}
