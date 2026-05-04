import time
from collections import OrderedDict
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass
class CacheEntry(Generic[T]):
    value: T
    expires_at: float


class TTLCache(Generic[T]):
    def __init__(self, ttl_seconds: int, max_size: int = 256) -> None:
        self.ttl_seconds = ttl_seconds
        self.max_size = max_size
        self._items: OrderedDict[str, CacheEntry[T]] = OrderedDict()

    def get(self, key: str) -> T | None:
        entry = self._items.get(key)
        if not entry:
            return None
        if entry.expires_at < time.time():
            self._items.pop(key, None)
            return None
        self._items.move_to_end(key)
        return entry.value

    def set(self, key: str, value: T) -> None:
        self._items[key] = CacheEntry(value=value, expires_at=time.time() + self.ttl_seconds)
        self._items.move_to_end(key)
        while len(self._items) > self.max_size:
            self._items.popitem(last=False)

    def clear(self) -> None:
        self._items.clear()

