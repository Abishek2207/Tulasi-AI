# Legacy file — all models now live in app.models.models
# Enums kept here for backward-compat imports
import enum

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class AuthProviderEnum(str, enum.Enum):
    LOCAL = "LOCAL"
    GOOGLE = "GOOGLE"
    GITHUB = "GITHUB"

class UserTypeEnum(str, enum.Enum):
    STUDENT = "STUDENT"
    PROFESSIONAL = "PROFESSIONAL"
