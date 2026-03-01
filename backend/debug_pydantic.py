import pydantic
print(f"Pydantic version: {pydantic.__version__}")
try:
    from pydantic import fields
    print("Successfully imported fields from pydantic")
except ImportError as e:
    print(f"ImportError: {e}")
    import traceback
    traceback.print_exc()

import langchain
print(f"LangChain version: {langchain.__version__}")
