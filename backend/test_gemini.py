import os
from dotenv import load_dotenv
load_dotenv()
from app.core.ai_router import get_ai_response
import json

try:
    print(get_ai_response('hi'))
except Exception as e:
    print("FAILED:", str(e))
