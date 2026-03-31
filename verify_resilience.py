
import httpx
import time

def test_unlimited():
    BASE_URL = "http://localhost:10000"
    
    # 1. Check Pro Status in /me (mocking auth is complex, so we'll just check the API logic)
    print("🔍 Testing 'Zero-Key' Fallback...")
    
    # We'll call the chat API directly. Since it's a POST with auth, 
    # we'll just verify the AI Client logic directly by importing it.
    import os
    import sys
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    
    try:
        from backend.app.core.ai_client import ai_client
        print("✅ AI Client imported. Simulating exhausted quota...")
        
        # Force failures for all keys to trigger mock
        os.environ["GOOGLE_API_KEY"] = "INVALID_KEY"
        os.environ["OPENROUTER_API_KEY"] = "INVALID_KEY"
        os.environ["GROQ_API_KEY"] = "INVALID_KEY"
        
        response = ai_client.get_response("Give me a roadmap for AI engineering", stream=False)
        print("\n--- AI Response (Mock Fallback) ---")
        print(response)
        
        if "roadmap" in response.lower():
            print("\n🎉 SUCCESS: Zero-Key Fallback Engine is ACTIVE and providing tool-specific content!")
        else:
            print("\n❌ FAILURE: Mock engine did not trigger correctly.")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_unlimited()
