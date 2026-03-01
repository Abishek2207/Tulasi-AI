import sys
import pydantic

def try_shim(name, target):
    try:
        sys.modules[name] = target
        from fastapi import FastAPI
        print(f"SUCCESS with {name}")
        return True
    except Exception:
        return False

from pydantic import v1 as pydantic_v1
print(f"Pydantic v1 dir: {dir(pydantic_v1)}")

# Try various shims
sys.modules["pydantic.fields"] = pydantic_v1.fields
try:
    from fastapi import FastAPI
    print("SUCCESS: from fastapi import FastAPI with pydantic.fields shim")
except Exception as e:
    print(f"FAIL: {e}")
    import traceback
    traceback.print_exc()
