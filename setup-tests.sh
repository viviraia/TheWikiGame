#!/bin/bash

# Quick Test Setup and Execution Script
# Run this to get started with testing

echo "🧪 Kawaa Test Suite - Quick Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm detected: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing test dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Install Playwright browsers
echo "🌐 Installing Playwright browsers (this may take a few minutes)..."
npx playwright install

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to install Playwright browsers"
    echo "   You can install them later with: npx playwright install"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Available test commands:"
echo "  npm test              - Run all unit & integration tests"
echo "  npm run test:watch    - Run tests in watch mode"
echo "  npm run test:unit     - Run unit tests only"
echo "  npm run test:e2e      - Run end-to-end tests"
echo "  npm test -- --coverage - Run with coverage report"
echo ""
echo "Quick test run:"
echo "  Running unit tests..."
echo ""

npm test

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    echo ""
    echo "📊 To see coverage report:"
    echo "   npm test -- --coverage"
    echo "   Then open: coverage/lcov-report/index.html"
    echo ""
    echo "🚀 To run E2E tests:"
    echo "   npm run test:e2e"
    echo ""
else
    echo ""
    echo "❌ Some tests failed. Please check the output above."
    echo ""
fi

echo "📖 For detailed documentation, see TESTING.md"
echo ""
