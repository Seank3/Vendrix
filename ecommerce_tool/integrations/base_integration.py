# integrations/base_integration.py
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseIntegration(ABC):
    @abstractmethod
    def authenticate(self, credentials: Dict[str, str]) -> bool:
        pass
    
    @abstractmethod
    def fetch_orders(self, days_back: int) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def format_orders(self, raw_orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass