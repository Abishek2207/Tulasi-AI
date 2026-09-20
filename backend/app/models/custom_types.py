from sqlalchemy import TypeDecorator, String
from pgvector.sqlalchemy import Vector
from app.core.database import is_sqlite

class VectorType(TypeDecorator):
    impl = String
    cache_ok = True
    
    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(Vector(768))
        else:
            return dialect.type_descriptor(String())

    class comparator_factory(TypeDecorator.Comparator):
        def cosine_distance(self, other):
            from sqlalchemy.types import Float
            return self.expr.op('<=>', return_type=Float)(other)
