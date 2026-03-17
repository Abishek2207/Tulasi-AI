import os
from dotenv import load_dotenv
load_dotenv()
from app.core.ai_router import call_gemini_with_fallback
import json

try:
    print(call_gemini_with_fallback([{'role':'user', 'parts':[{'text':'hi'}]}]))
except Exception as e:
    print("FAILED:", str(e))
