from sqlmodel import SQLModel, Field
from sqlalchemy.schema import CreateTable
from sqlalchemy import create_engine

class HackathonMock(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    mode: str = Field(default="Online", sa_column_kwargs={"quote": True})

print(CreateTable(HackathonMock.__table__).compile(create_engine('postgresql://')).string)
