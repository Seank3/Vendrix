# PowerShell script to run Django backend
$envPath = "C:\Users\IAN NAMBOGA MADETE\Downloads\ecommerce_tool\env\Scripts\activate.ps1"
$backendPath = "C:\Users\IAN NAMBOGA MADETE\Downloads\ecommerce_tool\backend"

# Activate virtual environment
& $envPath

# Change to backend directory
Set-Location $backendPath

# Run Django server
python manage.py runserver 8000
