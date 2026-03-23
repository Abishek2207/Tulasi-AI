import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

try:
    from app.core.ai_client import ai_client
    print("✅ ai_client imported successfully")
    
    from app.core.ai_router import get_ai_response
    print("✅ ai_router refactor verified")
    
    from app.api.chat import router as chat_router
    print("✅ chat.py refactor verified")
    
    from app.services.ai_agents.agents.rag_agent import rag_agent
    print("✅ rag_agent refactor verified")
    
except Exception as e:
    print(f"❌ Verification failed: {e}")
    import traceback
    traceback.print_exc()
