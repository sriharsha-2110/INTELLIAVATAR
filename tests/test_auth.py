def test_register_and_login(client):
    # 1. Register a new user & org
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "student@university.edu",
            "password": "strong-password-123",
            "organization_name": "CSE Final Year Dept"
        }
    )
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert reg_data["success"] is True
    assert reg_data["user"]["email"] == "student@university.edu"
    assert "id" in reg_data["organization"]

    # 2. Login with registered credentials
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "student@university.edu",
            "password": "strong-password-123"
        }
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["success"] is True
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "student@university.edu"

    # 3. Login with incorrect password
    bad_login = client.post(
        "/api/v1/auth/login",
        json={
            "email": "student@university.edu",
            "password": "wrong-password"
        }
    )
    assert bad_login.status_code == 401
    assert "Incorrect email or password." in bad_login.json()["detail"]
