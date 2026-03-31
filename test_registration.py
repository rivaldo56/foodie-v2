import requests


def test_api():
    base_url = "http://localhost:8000/api"
    print("Registering user...")
    resp = requests.post(
        f"{base_url}/users/register/",
        json={
            "email": "testchef2@example.com",
            "username": "testchef2",
            "first_name": "Test",
            "last_name": "Chef",
            "password": "Password123!",
            "password_confirm": "Password123!",
            "role": "chef",
        },
    )
    print(f"Registration response: {resp.status_code}")
    if resp.status_code != 201:
        print(resp.json())
        # Try login if already exists
        resp = requests.post(
            f"{base_url}/users/login/",
            json={"email": "testchef2@example.com", "password": "Password123!"},
        )
        print(f"Login response: {resp.status_code}")

    data = resp.json()
    token = data.get("token")
    print(f"Token: {token}")

    if token:
        print("\nFetching profile...")
        headers = {"Authorization": f"Token {token}"}
        profile_resp = requests.get(f"{base_url}/users/profile/", headers=headers)
        print(f"Profile response: {profile_resp.status_code}")
        print(profile_resp.text)


test_api()
