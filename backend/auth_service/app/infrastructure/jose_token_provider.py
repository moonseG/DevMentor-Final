import os
from datetime import datetime, timedelta, timezone

from jose import jwt

from app.domain.token_provider import TokenProvider


class JoseTokenProvider(TokenProvider):

    def __init__(self):
        self.secret_key = os.getenv("JWT_SECRET_KEY", "change-this-secret")
        self.algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.expire_minutes = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=self.expire_minutes)
        to_encode.update({"exp": expire})

        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
