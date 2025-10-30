@echo off
REM Quick Test Setup and Execution Script for Windows
REM Run this to get started with testing

echo.
echo 🧪 Kawaa Test Suite - Quick Setup
echo ==================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo ✅ Node.js detected
node --version
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    exit /b 1
)

echo ✅ npm detected
npm --version
echo.

REM Install dependencies
echo 📦 Installing test dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

REM Install Playwright browsers
echo 🌐 Installing Playwright browsers (this may take a few minutes)...
call npx playwright install

if %errorlevel% neq 0 (
    echo ⚠️  Warning: Failed to install Playwright browsers
    echo    You can install them later with: npx playwright install
)

echo.
echo 🎉 Setup complete!
echo.
echo Available test commands:
echo   npm test              - Run all unit ^& integration tests
echo   npm run test:watch    - Run tests in watch mode
echo   npm run test:unit     - Run unit tests only
echo   npm run test:e2e      - Run end-to-end tests
echo   npm test -- --coverage - Run with coverage report
echo.
echo Quick test run:
echo   Running unit tests...
echo.

call npm test

if %errorlevel% equ 0 (
    echo.
    echo ✅ All tests passed!
    echo.
    echo 📊 To see coverage report:
    echo    npm test -- --coverage
    echo    Then open: coverage\lcov-report\index.html
    echo.
    echo 🚀 To run E2E tests:
    echo    npm run test:e2e
    echo.
) else (
    echo.
    echo ❌ Some tests failed. Please check the output above.
    echo.
)

echo 📖 For detailed documentation, see TESTING.md
echo.

pause
