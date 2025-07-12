#!/bin/bash
# Usage: ./scripts/publish.sh [patch|minor|major]

set -e

VERSION_TYPE=${1:-patch}

echo "Starting publication process for ASCIIGround..."

CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo "Error: you must be on the master branch to publish."
    echo "Current branch: $CURRENT_BRANCH."
    exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
    echo "Error: working directory is not clean."
    echo "Please commit or stash your changes first."
    git status
    exit 1
fi

echo "Pulling latest changes..."
git pull origin master

echo "Installing dependencies..."
npm ci

echo "Running tests..."
npm run test:run

echo "Running type check..."
npm run typecheck

echo "Running linter..."
npx eslint src/**/*.ts

echo "Building library..."
npm run build

if [ ! -f "dist/asciiground.umd.js" ] || [ ! -f "dist/asciiground.es.js" ] || [ ! -f "dist/index.d.ts" ]; then
    echo "Error: build files are missing."
    ls -la dist/
    exit 1
fi

echo "Bumping version ($VERSION_TYPE)..."
npm version $VERSION_TYPE

NEW_VERSION=$(node -p "require('./package.json').version")
echo "New version: $NEW_VERSION."

echo "Pushing version bump..."
git push origin master --tags

echo "Publication initiated!"
echo "Version $NEW_VERSION has been tagged and pushed"
echo "GitHub Actions will now handle:"
echo "  - NPM publication"
echo "  - CDN deployment"
echo "  - Documentation update"
echo ""
echo "Monitor progress at:"
echo "   https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/.]*\/[^/.]*\).*/\1/')/actions"
