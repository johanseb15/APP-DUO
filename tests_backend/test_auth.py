import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from httpx import AsyncClient
from backend.server import app

@pytest.mark.asyncio
async def test_admin_login():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/admin/login", json={
            "email": "admin@duoprevia.com",
            "password": "admin123"
        })
    assert response.status_code == 200
    json_data = response.json()
    assert "access_token" in json_data
