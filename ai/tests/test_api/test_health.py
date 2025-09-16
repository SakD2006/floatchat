from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Tests if the health check endpoint is working."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"message": "OK"}