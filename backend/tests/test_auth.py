import pytest
from faker import Faker

fake = Faker()

@pytest.mark.asyncio
async def test_create_restaurant_and_login(async_client, superadmin_token):
    # Create a new restaurant and admin user
    restaurant_data = {
        "name": fake.company(),
        "slug": fake.slug(),
        "description": fake.text(),
        "logo": fake.image_url(),
        "email": fake.email(),
        "phone": fake.phone_number(),
        "address": fake.address(),
        "city": fake.city(),
        "country": fake.country(),
        "admin_username": fake.user_name(),
        "admin_password": "password123"
    }
    headers = {"Authorization": f"Bearer {superadmin_token}"}
    response = await async_client.post("/superadmin/restaurants", json=restaurant_data, headers=headers)
    assert response.status_code == 200

    # Login with the new admin user
    login_data = {
        "username": restaurant_data["admin_username"],
        "password": "password123",
        "restaurant_slug": restaurant_data["slug"]
    }
    response = await async_client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token

    # Access a protected route
    headers = {"Authorization": f"Bearer {token}"}
    response = await async_client.get(f"/api/restaurants/{restaurant_data['slug']}", headers=headers)
    assert response.status_code == 200