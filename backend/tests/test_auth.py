def test_register_returns_token(client) -> None:
    response = client.post(
        "/auth/register",
        json={"email": "alex@example.com", "password": "password123"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user_id"]


def test_register_duplicate_email_returns_409(client) -> None:
    payload = {"email": "alex@example.com", "password": "password123"}

    first_response = client.post("/auth/register", json=payload)
    second_response = client.post("/auth/register", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "Email already registered"


def test_login_correct_credentials_returns_token(client) -> None:
    payload = {"email": "alex@example.com", "password": "password123"}
    client.post("/auth/register", json=payload)

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user_id"]


def test_login_wrong_password_returns_401(client) -> None:
    client.post(
        "/auth/register",
        json={"email": "alex@example.com", "password": "password123"},
    )

    response = client.post(
        "/auth/login",
        json={"email": "alex@example.com", "password": "wrongpass"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_get_auth_me_with_valid_token_returns_200(client) -> None:
    register_response = client.post(
        "/auth/register",
        json={"email": "alex@example.com", "password": "password123"},
    )
    token = register_response.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["email"] == "alex@example.com"


def test_get_auth_me_without_token_returns_401(client) -> None:
    response = client.get("/auth/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
