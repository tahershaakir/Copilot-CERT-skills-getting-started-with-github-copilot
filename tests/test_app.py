import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Soccer Team" in data

def test_signup_for_activity_success():
    # Use a unique email to avoid duplicate error
    email = "testuser1@mergington.edu"
    activity = "Soccer Team"
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]

def test_signup_for_activity_duplicate():
    email = "testuser2@mergington.edu"
    activity = "Basketball Club"
    # First signup should succeed
    response1 = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response1.status_code == 200
    # Second signup should fail (duplicate)
    response2 = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response2.status_code == 400
    assert "already signed up" in response2.json()["detail"]

def test_signup_for_nonexistent_activity():
    email = "testuser3@mergington.edu"
    activity = "Nonexistent Club"
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"