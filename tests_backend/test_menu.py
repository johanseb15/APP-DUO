import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from httpx import AsyncClient
from backend.server import app

@pytest.mark.asyncio
async def test_get_menu():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/menu")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
