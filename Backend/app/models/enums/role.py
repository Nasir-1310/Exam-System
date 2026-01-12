from sqlalchemy import Enum as SQLAlchemyEnum
from enum import Enum

class UserRoleSQL(SQLAlchemyEnum):
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"
    USER = "USER"

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"
    USER = "USER"