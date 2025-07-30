import pytest
from faker import Faker

fake = Faker()

@pytest.mark.asyncio
async def test_admin_e2e_flow(async_client, superadmin_token):
    # 1. Create a new restaurant and admin user (Superadmin action)
    restaurant_slug = fake.slug()
    admin_username = fake.user_name()
    admin_password = "securepassword123"
    
    restaurant_data = {
        "name": fake.company(),
        "slug": restaurant_slug,
        "description": fake.text(),
        "logo": fake.image_url(),
        "email": fake.email(),
        "phone": fake.phone_number(),
        "address": fake.address(),
        "city": fake.city(),
        "country": fake.country(),
        "admin_username": admin_username,
        "admin_password": admin_password
    }
    headers = {"Authorization": f"Bearer {superadmin_token}"}
    response = await async_client.post("/superadmin/restaurants", json=restaurant_data, headers=headers)
    assert response.status_code == 200

    # 2. Login as the new admin user
    login_data = {
        "username": admin_username,
        "password": admin_password,
        "restaurant_slug": restaurant_slug
    }
    response = await async_client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create a new category
    category_data = {"name": "Postres", "icon": "🍰"}
    response = await async_client.post(f"/api/{restaurant_slug}/categories", json=category_data, headers=headers)
    assert response.status_code == 200
    category_id = response.json()["id"]
    assert category_id

    # 4. Create a new product in that category
    product_data = {
        "name": "Cheesecake de Fresa",
        "description": "Cremoso cheesecake con mermelada de fresa casera.",
        "price": 7500.0,
        "category_id": category_id
    }
    response = await async_client.post(f"/api/{restaurant_slug}/products", json=product_data, headers=headers)
    assert response.status_code == 200
    product_id = response.json()["id"]
    assert product_id

    # 5. Verify the product was created
    response = await async_client.get(f"/api/{restaurant_slug}/products/{product_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Cheesecake de Fresa"