from fastapi import APIRouter, Depends, HTTPException, status, Request
from models import TokenResponse, LoginRequest, RefreshTokenRequest

router = APIRouter()

@router.post("/auth/login", response_model=TokenResponse)
async def login(request: Request, login_data: LoginRequest):
    """Login para administradores de restaurante"""
    result = await request.app.state.auth_service.authenticate_user(
        login_data.username, 
        login_data.password, 
        login_data.restaurant_slug
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    return result

@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, refresh_data: RefreshTokenRequest):
    """Renovar token de acceso"""
    result = await request.app.state.auth_service.refresh_access_token(refresh_data.refresh_token)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido"
        )
    return result
