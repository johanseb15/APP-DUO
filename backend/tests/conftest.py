import pytest
import pytest_asyncio
from httpx import AsyncClient
from asgi_lifespan import LifespanManager

from main import app
from database import init_db, close_db, database
from auth import AuthService

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    await init_db()
    yield
    await close_db()

@pytest_asyncio.fixture(scope="session")
async def async_client():
    async with LifespanManager(app):
        async with AsyncClient(base_url="http://test", follow_redirects=True) as client:
            yield client

@pytest_asyncio.fixture(scope="session")
async def superadmin_token(async_client):
    auth_service = AuthService()
    # Create a superadmin user if it doesn't exist
    superadmin_username = "superadmin"
    superadmin_password = "admin123"
    superadmin_email = "superadmin@example.com"

    # Clear existing superadmin user if any, to ensure a clean state for the fixture
    await database.database.users.delete_many({"username": superadmin_username})

    await auth_service.create_user(
        username=superadmin_username,
        password=superadmin_password,
        restaurant_slug="superadmin", # A dummy slug for superadmin
        role="superadmin",
        email=superadmin_email
    )

    # Login as superadmin to get token
    login_data = {
        "username": superadmin_username,
        "password": superadmin_password,
        "restaurant_slug": "superadmin"
    }
    response = await async_client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    return response.json()["access_token"]
