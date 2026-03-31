#!/usr/bin/env python3
"""
Simple API testing script for ChefConnect
"""
import requests

BASE_URL = "http://localhost:8000/api"


def test_user_registration():
    """Test user registration endpoint"""
    print("🧪 Testing User Registration...")

    data = {
        "email": "testclient@example.com",
        "username": "testclient",
        "first_name": "Test",
        "last_name": "Client",
        "phone_number": "+1234567890",
        "role": "client",
        "password": "testpass123",
        "password_confirm": "testpass123",
    }

    try:
        response = requests.post(f"{BASE_URL}/users/register/", json=data)
        if response.status_code == 201:
            print("✅ User registration successful!")
            result = response.json()
            print(f"   User: {result['user']['email']}")
            print(f"   Token: {result['token'][:20]}...")
            return result["token"]
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure the server is running")
        return None


def test_user_login():
    """Test user login endpoint"""
    print("\n🧪 Testing User Login...")

    data = {"email": "admin@chefconnect.com", "password": "admin123"}

    try:
        response = requests.post(f"{BASE_URL}/users/login/", json=data)
        if response.status_code == 200:
            print("✅ User login successful!")
            result = response.json()
            print(f"   User: {result['user']['email']}")
            print(f"   Role: {result['user']['role']}")
            return result["token"]
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure the server is running")
        return None


def test_protected_endpoint(token):
    """Test a protected endpoint"""
    print("\n🧪 Testing Protected Endpoint (User Dashboard)...")

    headers = {"Authorization": f"Token {token}"}

    try:
        response = requests.get(f"{BASE_URL}/users/dashboard/", headers=headers)
        if response.status_code == 200:
            print("✅ Protected endpoint access successful!")
            result = response.json()
            print(f"   User: {result['user']['email']}")
            if "stats" in result:
                print(f"   Stats: {result['stats']}")
        else:
            print(f"❌ Protected endpoint failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure the server is running")


def test_chef_list():
    """Test chef list endpoint"""
    print("\n🧪 Testing Chef List Endpoint...")

    try:
        response = requests.get(f"{BASE_URL}/chefs/")
        if response.status_code == 200:
            print("✅ Chef list endpoint successful!")
            result = response.json()
            print(f"   Found {len(result)} chefs")
        else:
            print(f"❌ Chef list failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure the server is running")


def test_api_documentation():
    """Test API documentation endpoints"""
    print("\n🧪 Testing API Documentation...")

    try:
        # Test Swagger UI
        response = requests.get("http://localhost:8000/swagger/")
        if response.status_code == 200:
            print("✅ Swagger documentation accessible!")
        else:
            print(f"❌ Swagger documentation failed: {response.status_code}")

        # Test ReDoc
        response = requests.get("http://localhost:8000/redoc/")
        if response.status_code == 200:
            print("✅ ReDoc documentation accessible!")
        else:
            print(f"❌ ReDoc documentation failed: {response.status_code}")

    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure the server is running")


def test_api_root():
    """Test API root endpoint"""
    print("\n🧪 Testing API Root Endpoint...")

    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("✅ API root endpoint successful!")
            result = response.json()
            print(f"   Message: {result['message']}")
            print(f"   Version: {result['version']}")
        else:
            print(f"❌ API root failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure the server is running")


def main():
    """Run all API tests"""
    print("🚀 ChefConnect API Testing Suite")
    print("=" * 50)

    # Test basic endpoints
    test_api_root()
    test_api_documentation()
    test_chef_list()

    # Test authentication flow
    token = test_user_login()
    if token:
        test_protected_endpoint(token)

    # Test registration (optional - creates new user each time)
    # test_user_registration()

    print("\n" + "=" * 50)
    print("🎉 API Testing Complete!")
    print("\n📖 Access the API documentation at:")
    print("   • API Root: http://localhost:8000/")
    print("   • Swagger UI: http://localhost:8000/swagger/")
    print("   • ReDoc: http://localhost:8000/redoc/")
    print("   • Admin Panel: http://localhost:8000/admin/")
    print("\n🔐 Admin Credentials:")
    print("   • Email: admin@chefconnect.com")
    print("   • Password: admin123")


if __name__ == "__main__":
    main()
