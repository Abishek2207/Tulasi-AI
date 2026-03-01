import sys
import pydantic
print(f"Python path: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"Pydantic version: {pydantic.__version__}")
print(f"Pydantic file: {pydantic.__file__}")

try:
    from pydantic import fields
    print("SUCCESS: from pydantic import fields")
except ImportError as e:
    print(f"FAILURE: from pydantic import fields - {e}")

try:
    import pydantic.v1
    print("SUCCESS: import pydantic.v1")
    print(f"pydantic.v1 file: {pydantic.v1.__file__}")
except ImportError as e:
    print(f"FAILURE: import pydantic.v1 - {e}")

try:
    from fastapi import FastAPI
    print("SUCCESS: from fastapi import FastAPI")
except ImportError as e:
    print(f"FAILURE: from fastapi import FastAPI - {e}")
    import traceback
    traceback.print_exc()
