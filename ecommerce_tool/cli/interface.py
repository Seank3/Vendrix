# cli/interface.py
import os
import time
import schedule
from colorama import Fore, Style
from config.config_manager import ConfigManager
from config.credential_manager import CredentialManager
from integrations.ecommerce_integration import EcommerceIntegration

class CLI:
    def __init__(self):
        self.config_manager = ConfigManager()
        self.credential_manager = CredentialManager()
        self.integration = EcommerceIntegration(self.config_manager, self.credential_manager)
        # Move all CLI methods here