from sqlalchemy import Enum as SQLAlchemyEnum

class UserRole(SQLAlchemyEnum):
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"
    USER = "USER"