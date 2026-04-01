import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import select
from sqlalchemy.dialects import postgresql
from app.models.models import Hackathon

query = select(Hackathon).order_by(Hackathon.id.desc()).offset(0).limit(10)
compiled = query.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True})
print(compiled)
