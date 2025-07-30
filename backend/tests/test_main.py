import pytest

@pytest.mark.asyncio
async def test_read_root(async_client):
    response = await async_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "Food Delivery API Running", "version": "1.0.0"}