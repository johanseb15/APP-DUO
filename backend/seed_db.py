
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

# Cargar variables de entorno
load_dotenv()

# Configuración de la base de datos
mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
database_name = os.getenv("DATABASE_NAME", "food_delivery_multi")

# Usar un cliente síncrono para facilitar el script de seeding
client = MongoClient(mongodb_url)
db = client[database_name]

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def main():
    print("Starting database seeding...")

    # Limpiar colecciones existentes
    db.restaurants.delete_many({})
    db.users.delete_many({})
    db.categories.delete_many({})
    db.products.delete_many({})
    db.orders.delete_many({})
    db.push_subscriptions.delete_many({})

    print("Collections cleared.")

    # --- 1. Crear Restaurante ---
    restaurant_slug = "delipizza"
    restaurant = {
        "_id": ObjectId(),
        "name": "DeliPizza",
        "slug": restaurant_slug,
        "description": "Las mejores pizzas de la ciudad.",
        "logo": "https://cdn-icons-png.flaticon.com/512/3595/3595458.png",
        "email": "contacto@delipizza.com",
        "phone": "123456789",
        "address": "Av. Siempre Viva 123",
        "city": "Córdoba",
        "country": "Argentina",
        "settings": {
            "colors": {
                "primary": "#E74C3C",
                "secondary": "#F1C40F",
                "accent": "#2ECC71"
            },
            "delivery_zones": [
                {"name": "Centro", "delivery_fee": 50.0, "min_order": 500.0, "delivery_time": "30-45 min"},
                {"name": "Nueva Córdoba", "delivery_fee": 60.0, "min_order": 600.0, "delivery_time": "40-55 min"}
            ],
            "min_order_amount": 500.0,
            "delivery_fee": 50.0,
            "is_open": True,
            "opening_hours": {},
            "accept_cash": True,
            "accept_cards": True
        },
        "is_active": True,
        "created_at": "2025-08-01T12:00:00Z",
        "updated_at": "2025-08-01T12:00:00Z"
    }
    db.restaurants.insert_one(restaurant)
    restaurant_id = restaurant["_id"]
    print(f"Restaurant '{restaurant['name']}' created.")

    # --- 2. Crear Usuario Administrador ---
    admin_user = {
        "_id": ObjectId(),
        "username": "admin_delipizza",
        "email": "admin@delipizza.com",
        "password_hash": get_password_hash("adminpass"),
        "name": "Admin DeliPizza",
        "role": "admin",
        "restaurant_id": restaurant_id,
        "restaurant_slug": restaurant_slug,
        "is_active": True,
        "created_at": "2025-08-01T12:00:00Z",
        "updated_at": "2025-08-01T12:00:00Z"
    }
    db.users.insert_one(admin_user)
    print(f"Admin user '{admin_user['username']}' created.")

    # --- 3. Crear Categorías ---
    categories = [
        {
            "_id": ObjectId(), "name": "Pizzas Clásicas", "icon": "🍕", "restaurant_id": restaurant_id, 
            "restaurant_slug": restaurant_slug, "display_order": 1, "is_active": True
        },
        {
            "_id": ObjectId(), "name": "Pizzas Especiales", "icon": "🌟", "restaurant_id": restaurant_id, 
            "restaurant_slug": restaurant_slug, "display_order": 2, "is_active": True
        },
        {
            "_id": ObjectId(), "name": "Bebidas", "icon": "🥤", "restaurant_id": restaurant_id, 
            "restaurant_slug": restaurant_slug, "display_order": 3, "is_active": True
        }
    ]
    db.categories.insert_many(categories)
    print(f"{len(categories)} categories created.")
    
    classic_pizzas_cat_id = categories[0]["_id"]
    special_pizzas_cat_id = categories[1]["_id"]
    drinks_cat_id = categories[2]["_id"]

    # --- 4. Crear Productos ---
    products = [
        # Pizzas Clásicas
        {
            "_id": ObjectId(), "name": "Muzzarella", "description": "Salsa de tomate, muzzarella y aceitunas.", "price": 1200,
            "image": "https://www.johaprato.com/files/styles/flexslider_full/public/pizza_de_mozzarella.jpg", "category_id": classic_pizzas_cat_id,
            "restaurant_id": restaurant_id, "restaurant_slug": restaurant_slug, "is_available": True, "is_popular": True
        },
        {
            "_id": ObjectId(), "name": "Napolitana", "description": "Muzzarella, tomate fresco y ajo.", "price": 1300,
            "image": "https://www.paulinacocina.net/wp-content/uploads/2021/10/pizza-napolitana-receta.jpg", "category_id": classic_pizzas_cat_id,
            "restaurant_id": restaurant_id, "restaurant_slug": restaurant_slug, "is_available": True
        },
        # Pizzas Especiales
        {
            "_id": ObjectId(), "name": "Cuatro Quesos", "description": "Muzzarella, provolone, roquefort y parmesano.", "price": 1500,
            "image": "https://imag.bonviveur.com/pizza-cuatro-quesos.jpg", "category_id": special_pizzas_cat_id,
            "restaurant_id": restaurant_id, "restaurant_slug": restaurant_slug, "is_available": True, "is_popular": True
        },
        {
            "_id": ObjectId(), "name": "Pizza de Rúcula y Jamón Crudo", "description": "Muzzarella, rúcula fresca, jamón crudo y tomates cherry.", "price": 1600,
            "image": "https://content-cocina.lecturas.com/medio/2022/01/13/pizza-de-rucula-y-jamon_b8382309_800x800.jpg", "category_id": special_pizzas_cat_id,
            "restaurant_id": restaurant_id, "restaurant_slug": restaurant_slug, "is_available": True
        },
        # Bebidas
        {
            "_id": ObjectId(), "name": "Coca-Cola 1.5L", "description": "Botella de Coca-Cola de 1.5 litros.", "price": 500,
            "image": "https://http2.mlstatic.com/D_NQ_NP_842992-MLA49924912378_052022-O.webp", "category_id": drinks_cat_id,
            "restaurant_id": restaurant_id, "restaurant_slug": restaurant_slug, "is_available": True
        }
    ]
    db.products.insert_many(products)
    print(f"{len(products)} products created.")

    # --- 5. Crear Pedido de Ejemplo ---
    order = {
        "_id": ObjectId(),
        "order_number": "DP-0001",
        "restaurant_id": restaurant_id,
        "restaurant_slug": restaurant_slug,
        "customer": {
            "name": "Juan Perez",
            "phone": "987654321",
            "address": "Calle Falsa 123"
        },
        "items": [
            {
                "product_id": str(products[0]["_id"]),
                "product_name": products[0]["name"],
                "quantity": 1,
                "unit_price": products[0]["price"],
                "total_price": products[0]["price"]
            },
            {
                "product_id": str(products[4]["_id"]),
                "product_name": products[4]["name"],
                "quantity": 1,
                "unit_price": products[4]["price"],
                "total_price": products[4]["price"]
            }
        ],
        "subtotal": 1700.0,
        "delivery_fee": 50.0,
        "total": 1750.0,
        "status": "pending",
        "payment_method": "cash",
        "is_delivery": True,
        "created_at": "2025-08-01T13:00:00Z",
        "updated_at": "2025-08-01T13:00:00Z"
    }
    db.orders.insert_one(order)
    print("Sample order created.")

    print("Database seeding finished successfully!")

if __name__ == "__main__":
    asyncio.run(main())
