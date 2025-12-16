#!/usr/bin/env python
"""
Django Backend Setup Script
Run this script to set up the Django backend with mock data.
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, cwd=None):
    """Run a shell command"""
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        sys.exit(1)
    return result.stdout

def main():
    backend_dir = Path(__file__).parent

    print("🚀 Setting up Django Backend...")

    # Install dependencies
    print("\n📦 Installing dependencies...")
    run_command("pip install -r requirements.txt", cwd=backend_dir)

    # Run migrations
    print("\n🗄️ Running database migrations...")
    run_command("python manage.py migrate", cwd=backend_dir)

    # Create superuser
    print("\n👤 Creating superuser...")
    run_command("python manage.py seed_users --count 1", cwd=backend_dir)

    # Seed mock data
    print("\n🌱 Seeding mock data...")
    run_command("python manage.py seed_users --count 10", cwd=backend_dir)
    run_command("python manage.py seed_projects --count 50", cwd=backend_dir)

    print("\n✅ Backend setup complete!")
    print("\n📋 Admin Credentials:")
    print("   Email: admin@example.com")
    print("   Password: admin123")
    print("\n🚀 To start the server, run:")
    print("   python manage.py runserver")
    print("\n🔗 API will be available at: http://localhost:8000/api/")

if __name__ == "__main__":
    main()
