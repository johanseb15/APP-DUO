from fastapi import APIRouter, Depends, HTTPException, status, Request
from models import RestaurantCreate, UserCreate, CategoryCreate, ProductCreate, DeliveryZone
from dependencies import get_current_user

router = APIRouter()

@router.post("/initialize-data")
async def initialize_sample_data(request: Request, current_user: dict = Depends(get_current_user)):
    """Initialize the database with sample data (Superadmin only)"""
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only superadmin can initialize data")

    # Check if a default restaurant already exists to prevent re-initialization
    existing_restaurant = await request.app.state.restaurant_service.get_by_slug("duo-previa")
    if existing_restaurant:
        return {"message": "Sample data already initialized"}

    try:
        # 1. Create a sample restaurant
        restaurant_data = RestaurantCreate(
            name="DUO Previa",
            slug="duo-previa",
            description="Progressive Web App para delivery de comida rápida en Córdoba, Argentina",
            logo="https://placehold.co/100x100/dc2626/f9fafb?text=DUO",
            email="info@duoprevia.com",
            phone="+5493511234567",
            address="Av. Colón 123",
            city="Córdoba",
            country="Argentina",
            admin_username="admin",
            admin_password="admin123"
        )
        new_restaurant = await request.app.state.restaurant_service.create_restaurant(restaurant_data)
        restaurant_id = new_restaurant.id
        restaurant_slug = new_restaurant.slug

        # 2. Create default categories for the new restaurant
        categories_to_create = [
            {"name": "Lomitos", "icon": "", "display_order": 1},
            {"name": "Hamburguesas", "icon": "", "display_order": 2},
            {"name": "Empanadas", "icon": "", "display_order": 3},
            {"name": "Bebidas", "icon": "", "display_order": 4},
        ]
        created_categories = {}
        for cat_data in categories_to_create:
            category = await request.app.state.category_service.create_category(
                restaurant_slug,
                CategoryCreate(**cat_data)
            )
            created_categories[category.name] = category.id

        # 3. Create sample products for the new restaurant
        products_to_create = [
            {
                "name": "Lomito Clásico",
                "description": "Tierna carne de lomo, lechuga, tomate, huevo y mayonesa de la casa.",
                "price": 15500.0,
                "image": "https://placehold.co/600x400/cccccc/333333?text=Lomito",
                "category_id": created_categories["Lomitos"],
                "is_popular": True
            },
            {
                "name": "Hamburguesa DUO",
                "description": "Doble medallón de carne, queso cheddar, panceta crocante, y salsa DUO.",
                "price": 14000.0,
                "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop",
                "category_id": created_categories["Hamburguesas"],
                "is_popular": True
            },
            {
                "name": "Empanada de Carne",
                "description": "Jugosa carne cortada a cuchillo, con la receta tradicional cordobesa.",
                "price": 1800.0,
                "image": "https://images.unsplash.com/photo-1628323283129-3f4942995f49?q=80&w=2070&auto=format&fit=crop",
                "category_id": created_categories["Empanadas"]
            },
            {
                "name": "Coca-Cola 500ml",
                "description": "Botella de 500ml, bien fría.",
                "price": 2000.0,
                "image": "https://images.unsplash.com/photo-1622483767028-3f66f32a2ea7?q=80&w=1974&auto=format&fit=crop",
                "category_id": created_categories["Bebidas"]
            },
        ]
        for prod_data in products_to_create:
            await request.app.state.product_service.create_product(
                restaurant_slug,
                ProductCreate(**prod_data)
            )

        # 4. Create sample delivery zones
        delivery_zones_to_create = [
            DeliveryZone(name="Centro", delivery_fee=300.0, estimated_time="20-30 min"),
            DeliveryZone(name="Nueva Córdoba", delivery_fee=400.0, estimated_time="25-35 min"),
            DeliveryZone(name="Cerro de las Rosas", delivery_fee=500.0, estimated_time="30-45 min"),
            DeliveryZone(name="Güemes", delivery_fee=350.0, estimated_time="20-30 min"),
        ]
        # Update restaurant settings with delivery zones
        await request.app.state.restaurant_service.update_restaurant(
            restaurant_slug,
            {"settings": {"delivery_zones": [zone.dict() for zone in delivery_zones_to_create]}}
        )

        return {"message": "Sample data initialized successfully for DUO Previa"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to initialize data: {e}")
