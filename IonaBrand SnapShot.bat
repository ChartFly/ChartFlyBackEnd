@echo off
setlocal

set PROJECT_NAME=ionabrand
set ZIP_NAME=%PROJECT_NAME%_Snapshot.zip

if exist %ZIP_NAME% del %ZIP_NAME%

:: Build PowerShell command string dynamically
set "pscmd=$paths = @();"

:: Include key folders
if exist api (
    set "pscmd=%pscmd% $paths += 'api';"
)
if exist control_console (
    set "pscmd=%pscmd% $paths += 'control_console';"
)
if exist static (
    set "pscmd=%pscmd% $paths += 'static';"
)
if exist templates (
    set "pscmd=%pscmd% $paths += 'templates';"
)

:: Include key individual files
if exist main.py (
    set "pscmd=%pscmd% $paths += 'main.py';"
)
if exist initialize_dp.py (
    set "pscmd=%pscmd% $paths += 'initialize_dp.py';"
)
if exist test_db.py (
    set "pscmd=%pscmd% $paths += 'test_db.py';"
)
if exist test_nasdaq_api.py (
    set "pscmd=%pscmd% $paths += 'test_nasdaq_api.py';"
)
if exist requirements.txt (
    set "pscmd=%pscmd% $paths += 'requirements.txt';"
)
if exist render.yaml (
    set "pscmd=%pscmd% $paths += 'render.yaml';"
)
if exist .pre-commit-config.yaml (
    set "pscmd=%pscmd% $paths += '.pre-commit-config.yaml';"
)

:: Skip .venv, .git, pycache, workspace junk etc.

:: If no paths found, exit early
if "%pscmd%"=="$paths = @();" (
    echo ❌ No folders or files found to zip.
    pause
    exit /b
)

:: Add zip creation command
set "pscmd=%pscmd% Compress-Archive -Path $paths -DestinationPath '%ZIP_NAME%'"

:: Run the command and echo the full command string first
echo Running PowerShell command:
echo %pscmd%
powershell -Command "%pscmd%"

echo ✅ Snapshot created: %ZIP_NAME%
pause
