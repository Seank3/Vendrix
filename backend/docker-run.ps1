# Docker Management Script for Windows PowerShell
# Run this script from the backend directory

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "start"
)

function Write-Header {
    param([string]$Message)
    Write-Host "`n==========================================" -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor White
    Write-Host "==========================================" -ForegroundColor Cyan
}

function Wait-For-Service {
    param([string]$Service, [int]$Timeout = 60)
    Write-Host "Waiting for $Service to be ready..." -ForegroundColor Yellow
    $counter = 0
    while ($counter -lt $Timeout) {
        try {
            if ($Service -eq "postgres") {
                $result = docker-compose exec -T db pg_isready -U postgres -d ecommerce_db 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "$Service is ready!" -ForegroundColor Green
                    return $true
                }
            }
            elseif ($Service -eq "django") {
                $response = Invoke-WebRequest -Uri "http://localhost:8000/api/dashboard/metrics/" -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    Write-Host "$Service is ready!" -ForegroundColor Green
                    return $true
                }
            }
        }
        catch {
            # Service not ready yet
        }
        Start-Sleep -Seconds 2
        $counter += 2
        Write-Host "." -NoNewline
    }
    Write-Host "`n$Service failed to start within $Timeout seconds" -ForegroundColor Red
    return $false
}

switch ($Action) {
    "build" {
        Write-Header "Building Docker Images"
        docker-compose build --no-cache
        Write-Host "Build complete!" -ForegroundColor Green
    }

    "start" {
        Write-Header "Starting Docker Services"
        docker-compose up -d

        Write-Host "Waiting for services to start..." -ForegroundColor Yellow

        # Wait for PostgreSQL
        if (Wait-For-Service "postgres" 60) {
            # Wait for Django
            if (Wait-For-Service "django" 60) {
                Write-Host "`nAll services are running!" -ForegroundColor Green
                Write-Host "`nAccess your application:" -ForegroundColor White
                Write-Host "  Backend API: http://localhost:8000/api/" -ForegroundColor Cyan
                Write-Host "  Admin Panel: http://localhost:8000/admin/" -ForegroundColor Cyan
                Write-Host "  Frontend:   http://localhost:5173/" -ForegroundColor Cyan
            }
        }
    }

    "stop" {
        Write-Header "Stopping Docker Services"
        docker-compose down
        Write-Host "Services stopped!" -ForegroundColor Green
    }

    "restart" {
        Write-Header "Restarting Docker Services"
        docker-compose restart
        Write-Host "Services restarted!" -ForegroundColor Green
    }

    "migrate" {
        Write-Header "Running Database Migrations"
        docker-compose exec web python manage.py migrate
        Write-Host "Migrations complete!" -ForegroundColor Green
    }

    "createsuperuser" {
        Write-Header "Creating Django Superuser"
        Write-Host "You'll be prompted to enter superuser details..." -ForegroundColor Yellow
        docker-compose exec web python manage.py createsuperuser
    }

    "seed" {
        Write-Header "Seeding Database with Mock Data"
        docker-compose exec web python manage.py seed_users --count 10
        docker-compose exec web python manage.py seed_projects --count 50
        Write-Host "Database seeded!" -ForegroundColor Green
    }

    "logs" {
        Write-Header "Showing Docker Logs"
        docker-compose logs -f
    }

    "shell" {
        Write-Header "Opening Django Shell"
        docker-compose exec web python manage.py shell
    }

    "dbshell" {
        Write-Header "Opening Database Shell"
        docker-compose exec db psql -U postgres -d ecommerce_db
    }

    "clean" {
        Write-Header "Cleaning Up Docker Resources"
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Host "Cleanup complete!" -ForegroundColor Green
    }

    default {
        Write-Host "Usage: .\docker-run.ps1 -Action <action>" -ForegroundColor White
        Write-Host "`nAvailable actions:" -ForegroundColor Cyan
        Write-Host "  build          - Build Docker images" -ForegroundColor White
        Write-Host "  start          - Start all services" -ForegroundColor White
        Write-Host "  stop           - Stop all services" -ForegroundColor White
        Write-Host "  restart        - Restart all services" -ForegroundColor White
        Write-Host "  migrate        - Run database migrations" -ForegroundColor White
        Write-Host "  createsuperuser- Create Django superuser" -ForegroundColor White
        Write-Host "  seed           - Seed database with mock data" -ForegroundColor White
        Write-Host "  logs           - Show service logs" -ForegroundColor White
        Write-Host "  shell          - Open Django shell" -ForegroundColor White
        Write-Host "  dbshell        - Open database shell" -ForegroundColor White
        Write-Host "  clean          - Clean up Docker resources" -ForegroundColor White
        Write-Host "`nExample: .\docker-run.ps1 -Action start" -ForegroundColor Yellow
    }
}
