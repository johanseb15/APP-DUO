import pytest
from faker import Faker

fake = Faker()

@pytest.mark.asyncio
async def test_public_endpoints_flow(async_client, superadmin_token):
    # 1. Initialize sample data for a restaurant
    # This will create 'duo-previa' restaurant, admin, categories, products, and delivery zones
    headers = {"Authorization": superadmin_token}
    response = await async_client.post("/initialize-data", headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Sample data initialized successfully for DUO Previa"

    restaurant_slug = "duo-previa"

    # 2. Test GET /api/{slug}/menu
    response = await async_client.get(f"/api/{restaurant_slug}/menu")
    assert response.status_code == 200
    menu_items = response.json()
    assert len(menu_items) > 0
    assert "Lomito Clásico" in [item["name"] for item in menu_items]

    # 3. Test GET /api/{slug}/menu/category/{category_name}
    response = await async_client.get(f"/api/{restaurant_slug}/menu/category/lomitos")
    assert response.status_code == 200
    lomitos_menu = response.json()
    assert len(lomitos_menu) > 0
    assert all(item["category_id"] for item in lomitos_menu)

    # 4. Test GET /api/{slug}/delivery-zones
    response = await async_client.get(f"/api/{restaurant_slug}/delivery-zones")
    assert response.status_code == 200
    delivery_zones = response.json()
    assert len(delivery_zones) > 0
    assert "Centro" in [zone["name"] for zone in delivery_zones]

    # 5. Test POST /api/{slug}/orders
    # Get a product ID and category ID for the order
    lomito_product = next((item for item in menu_items if item["name"] == "Lomito Clásico"), None)
    assert lomito_product is not None

    order_data = {
        "customer": {
            "name": fake.name(),
            "phone": fake.phone_number(),
            "email": fake.email(),
            "address": fake.address(),
            "delivery_notes": fake.sentence()
        },
        "items": [
            {
                "product_id": lomito_product["id"],
                "product_name": lomito_product["name"],
                "quantity": 1,
                "unit_price": lomito_product["price"],
                "total_price": lomito_product["price"]
            }
        ],
        "payment_method": "WHATSAPP",
        "is_delivery": True,
        "notes": "Please deliver quickly",
        "delivery_zone": "Centro"
    }
    response = await async_client.post(f"/api/{restaurant_slug}/orders", json=order_data)
    assert response.status_code == 200
    created_order = response.json()
    assert created_order["customer"]["name"] == order_data["customer"]["name"]
    assert created_order["status"] == "pending"

    # 6. Test GET /api/{slug}/orders/{order_id}
    order_id = created_order["id"]
    response = await async_client.get(f"/api/{restaurant_slug}/orders/{order_id}")
    assert response.status_code == 200
    fetched_order = response.json()
    assert fetched_order["order_number"] == created_order["order_number"]
    assert fetched_order["customer"]["phone"] == order_data["customer"]["phone"]
