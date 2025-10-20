#!/usr/bin/env python3
"""
Simple script to test the search functionality
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_search_suggestions():
    """Test search suggestions endpoint"""
    print("Testing search suggestions...")
    
    # Test with a short query (should return empty)
    response = requests.get(f"{BASE_URL}/items/search_suggestions/?q=a")
    print(f"Short query 'a': {response.status_code} - {response.json()}")
    
    # Test with a longer query
    response = requests.get(f"{BASE_URL}/items/search_suggestions/?q=chair")
    print(f"Query 'chair': {response.status_code} - {response.json()}")

def test_search_items():
    """Test search items endpoint"""
    print("\nTesting search items...")
    
    # Test basic search
    response = requests.get(f"{BASE_URL}/items/?search=chair")
    print(f"Search 'chair': {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Found {len(data)} items")
        if data:
            print(f"First item: {data[0].get('title', 'No title')}")
    
    # Test search with filters
    response = requests.get(f"{BASE_URL}/items/?search=book&category=Books")
    print(f"Search 'book' with Books category: {response.status_code}")
    if response.status_code == 200:
        print(f"Found {len(response.json())} items")

def test_basic_items():
    """Test basic items endpoint"""
    print("\nTesting basic items endpoint...")
    
    response = requests.get(f"{BASE_URL}/items/")
    print(f"All items: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total items: {len(data)}")
        if data:
            print(f"Sample item: {data[0].get('title', 'No title')}")

if __name__ == "__main__":
    try:
        test_basic_items()
        test_search_suggestions()
        test_search_items()
        print("\n✅ Search functionality test completed!")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to Django server at http://127.0.0.1:8000")
        print("Make sure the Django server is running with: python manage.py runserver")
    except Exception as e:
        print(f"❌ Error: {e}")