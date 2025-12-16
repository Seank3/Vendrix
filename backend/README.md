# Ecommerce Dashboard Backend

Django REST Framework backend for the Ecommerce Integration Dashboard.

## Features

- 🔐 **JWT Authentication** with role-based access control
- 📊 **Dashboard Metrics** and KPIs
- 📈 **Analytics** with charts and performance data
- 🛒 **Projects/Orders Management** with full CRUD
- 👥 **User Management** with admin controls
- 🎯 **Mock Data** for development and testing
- 🐳 **Docker Support** for production deployment

## Quick Start

### Option 1: Local Development (SQLite)

```bash
# Install dependencies
pip install -r requirements.txt

# Run setup script (creates database, migrations, mock data)
python setup.py

# Start development server
python manage.py runserver
```

### Option 2: Docker Development (PostgreSQL) - RECOMMENDED

```powershell
# Navigate to backend directory
cd backend

# Build and start all services
.\docker-run.ps1 -Action build
.\docker-run.ps1 -Action start

# Run database migrations
.\docker-run.ps1 -Action migrate

# Create superuser (follow prompts)
.\docker-run.ps1 -Action createsuperuser

# Seed database with mock data
.\docker-run.ps1 -Action seed
```

### Option 3: Manual Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Seed data
docker-compose exec web python manage.py seed_users --count 10
docker-compose exec web python manage.py seed_projects --count 50

# Stop services
docker-compose down
```

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user
- `POST /api/auth/change-password/` - Change password

### Dashboard
- `GET /api/dashboard/metrics/` - Dashboard KPIs
- `GET /api/dashboard/overview/` - Dashboard overview

### Analytics
- `GET /api/analytics/overview/?range=30d` - Analytics data
- `GET /api/analytics/performance/?days=30` - Performance metrics

### Projects/Orders
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Get project details
- `PATCH /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project
- `GET /api/projects/{id}/history/` - Project history
- `GET /api/projects/stats/` - Project statistics
- `GET /api/projects/analytics/` - Project analytics

### Users
- `GET /api/users/` - List users (admin only)
- `POST /api/users/` - Create user (admin only)
- `GET /api/users/{id}/` - Get user details
- `PATCH /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

## Default Credentials

- **Admin**: `admin@example.com` / `admin123`
- **Test Users**: `user1@example.com` to `user10@example.com` / `password123`

## Environment Variables

Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Email settings (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# CORS settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Management Commands

```bash
# Create mock users
python manage.py seed_users --count 20

# Create mock projects
python manage.py seed_projects --count 100

# Create superuser
python manage.py createsuperuser
```

## Project Structure

```
backend/
├── dashboard/              # Main Django project
│   ├── settings.py        # Django settings
│   ├── urls.py           # Main URL configuration
│   └── wsgi.py           # WSGI config
├── users/                 # Authentication & user management
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── dashboard/             # Dashboard metrics & KPIs
│   ├── views.py
│   └── urls.py
├── analytics/             # Analytics & reporting
│   ├── views.py
│   └── urls.py
├── projects/              # Projects/orders management
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── manage.py
├── requirements.txt
├── setup.py              # Setup script
├── Dockerfile
└── docker-compose.yml
```

## Development

```bash
# Run tests
python manage.py test

# Create migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Access Django admin
# Visit: http://localhost:8000/admin/
```

## Production Deployment

### Using Docker

```bash
# Build and run
docker-compose -f docker-compose.prod.yml up -d

# Or using Docker directly
docker build -t ecommerce-backend .
docker run -p 8000:8000 ecommerce-backend
```

### Environment Variables for Production

```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DB_NAME=prod_db
DB_USER=prod_user
DB_PASSWORD=secure-password
DB_HOST=your-db-host
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
```

## API Response Examples

### Login Response
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }
}
```

### Dashboard Metrics
```json
{
  "revenue": 45231.00,
  "revenue_growth": 12.5,
  "orders": 234,
  "completed_orders": 189,
  "pending_orders": 35,
  "in_progress_orders": 10,
  "users": 15,
  "active_users": 12,
  "success_rate": 94.2
}
```

## Contributing

1. Create a feature branch
2. Write tests for new functionality
3. Ensure all tests pass
4. Submit a pull request

## License

MIT License