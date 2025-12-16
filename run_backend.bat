@echo off
cd /d "C:\Users\IAN NAMBOGA MADETE\Downloads\ecommerce_tool"
call env\Scripts\activate.bat
cd backend
python manage.py runserver 8000
pause
