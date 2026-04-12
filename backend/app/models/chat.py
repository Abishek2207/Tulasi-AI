# Legacy file — all models now live in app.models.models
import enum

class SenderEnum(str, enum.Enum):
    USER = "USER"
    AI = "AI"
