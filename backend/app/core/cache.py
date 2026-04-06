import time
from typing import Any, Dict, Optional

class SimpleCache:
    def __init__(self, ttl: int = 300):
        self._cache: Dict[str, Any] = {}
        self._expiry: Dict[str, float] = {}
        self.ttl = ttl

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            if time.time() < self._expiry[key]:
                return self._cache[key]
            else:
                del self._cache[key]
                del self._expiry[key]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        self._cache[key] = value
        self._expiry[key] = time.time() + (ttl or self.ttl)

    def clear(self):
        self._cache.clear()
        self._expiry.clear()

# Global instances for specific domains
hackathon_cache = SimpleCache(ttl=600)  # 10 minutes
review_cache = SimpleCache(ttl=3600)    # 1 hour
feed_cache = SimpleCache(ttl=60)        # 1 minute
