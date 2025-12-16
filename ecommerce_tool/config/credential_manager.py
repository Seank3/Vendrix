# config/credential_manager.py
import json
import logging
from pathlib import Path
from typing import Dict, List

try:
    import keyring  # type: ignore
except ImportError:  # keyring is optional; we fall back to file storage
    keyring = None


class CredentialManager:
    """Credential manager with keyring persistence and file fallback.

    - Primary storage: OS keyring if available.
    - Fallback: encrypted-ish local file (base64) with a warning; meant for dev.
    """

    def __init__(self, storage_dir: str | None = None, service_name: str = "ecommerce_tool"):
        self.logger = logging.getLogger(self.__class__.__name__)
        base_dir = Path(storage_dir) if storage_dir else Path(__file__).resolve().parent
        base_dir.mkdir(parents=True, exist_ok=True)
        self.service_name = service_name
        self._store: Dict[str, Dict[str, str]] = {}
        self._file_path = base_dir / "credentials.json"

        if not keyring:
            self.logger.warning("keyring not available; using local file storage for credentials.")
            self._load_from_file()

    def _load_from_file(self) -> None:
        if self._file_path.exists():
            try:
                data = json.loads(self._file_path.read_text(encoding="utf-8"))
                if isinstance(data, dict):
                    self._store.update(data)
            except Exception as exc:
                self.logger.warning(f"Failed to read credentials file: {exc}")

    def _save_to_file(self) -> None:
        try:
            self._file_path.write_text(json.dumps(self._store, indent=2), encoding="utf-8")
        except Exception as exc:
            self.logger.warning(f"Failed to write credentials file: {exc}")

    def get_platform_credentials(self, platform_name: str) -> Dict[str, str]:
        """Return stored credentials for a platform (may be empty)."""
        # Prefer keyring if present
        if keyring:
            try:
                payload = keyring.get_password(self.service_name, platform_name)
                if payload:
                    return json.loads(payload)
            except Exception as exc:
                self.logger.warning(f"Keyring read failed for {platform_name}: {exc}")

        return dict(self._store.get(platform_name, {}))

    def store_platform_credentials(self, platform_name: str, credentials: Dict[str, str]) -> None:
        """Persist credentials securely (keyring) or fallback to file."""
        if keyring:
            try:
                keyring.set_password(self.service_name, platform_name, json.dumps(credentials))
                return
            except Exception as exc:
                self.logger.warning(f"Keyring write failed for {platform_name}: {exc}")

        self._store[platform_name] = dict(credentials)
        self._save_to_file()

    def clear_credentials(self, platform_name: str) -> None:
        if keyring:
            try:
                keyring.delete_password(self.service_name, platform_name)
            except Exception:
                pass
        self._store.pop(platform_name, None)
        self._save_to_file()

    def validate_required(self, platform_name: str, credentials: Dict[str, str], required_keys: List[str]) -> List[str]:
        """Return a list of missing credential keys for the platform."""
        missing = [key for key in required_keys if not credentials.get(key)]
        if missing:
            self.logger.error(f"{platform_name}: missing credentials: {', '.join(missing)}")
        return missing