import io

def test_avatar_lifecycle_and_safety(client):
    # 1. Register and login to obtain token
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher@school.edu",
            "password": "secure-pass-99",
            "organization_name": "CSE Dept"
        }
    )
    assert reg_response.status_code == 201
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "teacher@school.edu",
            "password": "secure-pass-99"
        }
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Try creating avatar without safety consent check
    image_data = b"\x89PNG\r\n\x1a\n_dummy_png_bytes"
    files = {
        "image": ("avatar.png", io.BytesIO(image_data), "image/png")
    }
    data = {
        "name": "Prof. Rao",
        "description": "Deep learning tutor",
        "voice_key": "kn-IN-GaganNeural",
        "language_code": "kn",
        "consent_confirmed": "false"  # Consent false
    }
    
    no_consent_res = client.post("/api/v1/avatars", data=data, files=files, headers=headers)
    assert no_consent_res.status_code == 400
    assert "consent confirmation" in no_consent_res.json()["detail"].lower()

    # 3. Try creating avatar with invalid file format
    files_invalid = {
        "image": ("avatar.txt", io.BytesIO(b"not-an-image"), "text/plain")
    }
    data["consent_confirmed"] = "true"
    invalid_format_res = client.post("/api/v1/avatars", data=data, files=files_invalid, headers=headers)
    assert invalid_format_res.status_code == 400
    assert "invalid image format" in invalid_format_res.json()["detail"].lower()

    # 4. Create avatar successfully (PNG, with consent)
    files_valid = {
        "image": ("avatar.png", io.BytesIO(image_data), "image/png")
    }
    success_res = client.post("/api/v1/avatars", data=data, files=files_valid, headers=headers)
    assert success_res.status_code == 201
    avatar_id = success_res.json()["avatar"]["id"]
    assert avatar_id is not None

    # 5. List avatars (tenant isolation check)
    list_res = client.get("/api/v1/avatars", headers=headers)
    assert list_res.status_code == 200
    avatars = list_res.json()
    assert len(avatars) == 1
    assert avatars[0]["name"] == "Prof. Rao"

    # 6. Delete avatar
    delete_res = client.delete(f"/api/v1/avatars/{avatar_id}", headers=headers)
    assert delete_res.status_code == 200
    assert delete_res.json()["success"] is True

    # List should be empty now
    empty_res = client.get("/api/v1/avatars", headers=headers)
    assert len(empty_res.json()) == 0
