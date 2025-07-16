#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${GREEN}Compiling ASCIIGround demo page...${NC}"

# Create docs/demo directory if it doesn't exist.
mkdir -p docs/demo

# Compile the demo HTML page.
echo -e "${YELLOW}Building demo HTML...${NC}"
npm run build:demo

# Copy CSS files.
echo -e "${YELLOW}Copying styles...${NC}"
cp src/styles/common.css docs/demo/
cp src/styles/demo.css docs/demo/

echo -e "${GREEN}Demo page build completed (see docs/demo/).${NC}"
