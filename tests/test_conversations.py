import io

def test_conversation_pipeline_and_code_switching(client, db):
    # 1. Register & login to get token
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@conversations.org",
            "password": "secure-user-password",
            "organization_name": "Conversations Dept"
        }
    )
    token = client.post(
        "/api/v1/auth/login",
        json={"email": "user@conversations.org", "password": "secure-user-password"}
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create an Avatar in DB (PNG, with consent)
    image_bytes = b"\x89PNG\r\n\x1a\n_dummy_png_bytes"
    files = {
        "image": ("avatar.png", io.BytesIO(image_bytes), "image/png")
    }
    data = {
        "name": "Prof. Rao",
        "description": "Tutor",
        "voice_key": "kn-IN-GaganNeural",
        "language_code": "kn",
        "consent_confirmed": "true"
    }
    avatar_res = client.post("/api/v1/avatars", data=data, files=files, headers=headers)
    avatar_id = avatar_res.json()["avatar"]["id"]

    # 3. Start conversation session
    conv_res = client.post(
        "/api/v1/conversations",
        json={"avatar_id": avatar_id},
        headers=headers
    )
    assert conv_res.status_code == 200
    conv_id = conv_res.json()["conversation_id"]

    # 4. Send Message in English
    msg_data = {
        "text": "What is a Convolutional Neural Network?",
        "mode": "general",
        "language": "en"
    }
    msg_res = client.post(
        f"/api/v1/conversations/{conv_id}/message",
        data=msg_data,
        headers=headers
    )
    assert msg_res.status_code == 200
    res_data = msg_res.json()
    assert res_data["success"] is True
    assert "text" in res_data
    assert "audio_url" in res_data
    assert "video_url" in res_data
    assert res_data["language"] == "en"

    # 5. Send Message in Kannada (Code-switching query)
    msg_data_kn = {
        "text": "CNN structure explain ಮಾಡಿ.",
        "mode": "general",
        "language": "kn"
    }
    msg_res_kn = client.post(
        f"/api/v1/conversations/{conv_id}/message",
        data=msg_data_kn,
        headers=headers
    )
    assert msg_res_kn.status_code == 200
    res_data_kn = msg_res_kn.json()
    assert res_data_kn["success"] is True
    assert res_data_kn["language"] == "kn"
    assert res_data_kn["is_code_switched"] is True
    assert "ಕನ್ನಡ" in res_data_kn["text"] or "Convolutional Neural Network" in res_data_kn["text"]

    # 6. Retrieve conversation history
    history_res = client.get(f"/api/v1/conversations/{conv_id}", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history["messages"]) == 4  # 2 user messages, 2 assistant responses
