def register_and_authenticate(client):
    response = client.post(
        "/auth/register",
        json={"email": "sam@example.com", "password": "password123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_profile_returns_201(client) -> None:
    headers = register_and_authenticate(client)

    response = client.post(
        "/profile",
        headers=headers,
        json={
            "name": "Sam",
            "age": 10,
            "communication_style": "visual",
            "sensitivities": ["noise"],
            "triggers": ["waiting"],
            "calming_strategies": ["headphones"],
            "emergency_notes": "Prefers quiet spaces",
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "Sam"


def test_create_duplicate_profile_returns_409(client) -> None:
    headers = register_and_authenticate(client)
    payload = {
        "name": "Sam",
        "age": 10,
        "communication_style": "visual",
        "sensitivities": ["noise"],
        "triggers": ["waiting"],
        "calming_strategies": ["headphones"],
        "emergency_notes": "Prefers quiet spaces",
    }

    first_response = client.post("/profile", headers=headers, json=payload)
    second_response = client.post("/profile", headers=headers, json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_get_profile_returns_200(client) -> None:
    headers = register_and_authenticate(client)
    client.post(
        "/profile",
        headers=headers,
        json={
            "name": "Sam",
            "age": 10,
            "communication_style": "visual",
            "sensitivities": ["noise"],
            "triggers": ["waiting"],
            "calming_strategies": ["headphones"],
            "emergency_notes": "Prefers quiet spaces",
        },
    )

    response = client.get("/profile", headers=headers)

    assert response.status_code == 200
    assert response.json()["name"] == "Sam"


def test_update_profile_returns_200(client) -> None:
    headers = register_and_authenticate(client)
    client.post(
        "/profile",
        headers=headers,
        json={
            "name": "Sam",
            "age": 10,
            "communication_style": "visual",
            "sensitivities": ["noise"],
            "triggers": ["waiting"],
            "calming_strategies": ["headphones"],
            "emergency_notes": "Prefers quiet spaces",
        },
    )

    response = client.put(
        "/profile",
        headers=headers,
        json={"age": 11, "emergency_notes": "Updated note"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["age"] == 11
    assert body["emergency_notes"] == "Updated note"


def test_delete_profile_returns_204(client) -> None:
    headers = register_and_authenticate(client)
    client.post(
        "/profile",
        headers=headers,
        json={
            "name": "Sam",
            "age": 10,
            "communication_style": "visual",
            "sensitivities": ["noise"],
            "triggers": ["waiting"],
            "calming_strategies": ["headphones"],
            "emergency_notes": "Prefers quiet spaces",
        },
    )

    response = client.delete("/profile", headers=headers)
    get_response = client.get("/profile", headers=headers)

    assert response.status_code == 204
    assert get_response.status_code == 404
