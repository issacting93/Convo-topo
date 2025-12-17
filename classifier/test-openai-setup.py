#!/usr/bin/env python3
"""
Test script to verify OpenAI setup is working correctly.
"""

import os
import sys

def test_openai_setup():
    """Test that OpenAI is properly configured"""
    print("=== Testing OpenAI Setup ===\n")
    
    # Test 1: Check if package is installed
    print("1. Checking if OpenAI package is installed...")
    try:
        from openai import OpenAI
        print("   ✅ OpenAI package is installed\n")
    except ImportError:
        print("   ❌ OpenAI package not found")
        print("   Run: pip3 install openai\n")
        return False
    
    # Test 2: Check if API key is set
    print("2. Checking if OPENAI_API_KEY is set...")
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        # Mask the key for security
        masked_key = api_key[:7] + "..." + api_key[-4:] if len(api_key) > 11 else "***"
        print(f"   ✅ OPENAI_API_KEY is set ({masked_key})\n")
    else:
        print("   ❌ OPENAI_API_KEY not found in environment")
        print("   Set it with: export OPENAI_API_KEY=sk-your-key-here")
        print("   Or create a .env file and source it\n")
        return False
    
    # Test 3: Test API connection (optional, makes an API call)
    print("3. Testing API connection...")
    try:
        client = OpenAI()
        # Make a minimal test call
        response = client.models.list()
        print("   ✅ API connection successful\n")
        return True
    except Exception as e:
        error_msg = str(e)
        if "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
            print(f"   ❌ API authentication failed: {error_msg}\n")
            print("   Check that your API key is valid")
        else:
            print(f"   ⚠️  API connection issue: {error_msg}\n")
            print("   This might be a network issue or API key problem")
        return False

if __name__ == "__main__":
    success = test_openai_setup()
    if success:
        print("✅ All tests passed! OpenAI is ready to use.")
        print("\nYou can now run:")
        print("  python3 classifier-openai.py conversations.json output.json")
        sys.exit(0)
    else:
        print("❌ Setup incomplete. Please fix the issues above.")
        sys.exit(1)

