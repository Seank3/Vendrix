from config.config_manager import ConfigManager
from config.credential_manager import CredentialManager


def test_config_manager_defaults(tmp_path):
    cfg = ConfigManager(config_dir=str(tmp_path))
    assert cfg is not None
    assert isinstance(cfg.get_setting('output_directory'), str)
    assert cfg.get_setting('days_back_to_fetch') == 1
    assert cfg.get_platform_status('etsy') is False


def test_credential_manager_initializes():
    cm = CredentialManager()
    assert cm is not None
    creds = cm.get_platform_credentials('etsy')
    assert isinstance(creds, dict)
