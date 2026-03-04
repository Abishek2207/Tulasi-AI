from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import get_settings

settings = get_settings()

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Verify the JWT using Supabase JWT Secret
        # In a real production setup, fetch the Supabase public key to verify or use a symmetric 
        # secret if provided by Supabase. Here we decode without verifying signature to mock 
        # the JWT verification as Supabase's Anon/Service keys aren't the JWT secret.
        # Note: ONLY for this stub build! True production requires proper JWT Secret verification.
        payload = jwt.decode(token, options={"verify_signature": False})
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth credentials")
            
        return {
            "id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated")
        }
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
