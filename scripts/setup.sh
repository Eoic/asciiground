#!/bin/bash
# Development setup script.

set -e
echo "Setting up development environment..."

NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION."

echo "Installing dependencies..."
npm install

echo "Running initial build..."
npm run build

echo "Running tests..."
npm run test:run

echo "Type checking..."
npm run typecheck

echo "Development environment setup complete!"
echo ""
echo "Available commands:"
echo "   npm run dev           - Start development server."
echo "   npm run build         - Build the library."
echo "   npm run test          - Run tests in watch mode."
echo "   npm run test:run      - Run tests once."
echo "   npm run test:coverage - Run tests with coverage."
echo "   npm run typecheck     - Run type checking."
echo "   ./scripts/publish.sh  - Publish new version."
echo ""
echo "Open index.html in your browser to see the demo."
