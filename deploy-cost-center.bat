@echo off
echo Deploying Cost Center Migration...
echo.

REM Extract DB credentials from .env
for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr DATABASE_URL') do set DATABASE_URL=%%b

REM Parse connection string
REM Format: mysql://user:password@host:port/database
echo Connecting to database...

REM Direct MySQL execution
mysql -u root -p -e "USE koperasisystem_koperasi; SOURCE prisma/migrations/20260109_phase13_cost_center/migration.sql;"

if %errorlevel% == 0 (
    echo.
    echo ✓ Migration deployed successfully!
    echo ✓ Table cost_center created
) else (
    echo.
    echo ✗ Migration failed
    echo Please run SQL manually in MySQL Workbench
)

pause
