import sys
print("DEBUG START")

try:
    import pydantic
    print(f"Pydantic version: {pydantic.__version__}")
except Exception as e:
    print(f"Pydantic import fail: {e}")

try:
    from fastapi import FastAPI
    print("FastAPI import success")
except Exception as e:
    print("FastAPI import fail")
    import traceback
    traceback.print_exc()

try:
    import uvicorn
    print("Uvicorn import success")
except Exception as e:
    print("Uvicorn import fail")
    import traceback
    traceback.print_exc()

try:
    print("Importing main...")
    import main
    print("Main import success")
except Exception as e:
    print("Main import fail")
    import traceback
    traceback.print_exc()
