#!/bin/bash

# Script to help update Node.js version in Vercel
# This opens the Vercel dashboard to the exact settings page

PROJECT_NAME="jits-coding-platform"
PROJECT_ID="prj_KBUeYlcnkezBV7PqA6zqjDry1hV4"

echo "🔧 Updating Node.js Version in Vercel"
echo "======================================"
echo ""
echo "Project: $PROJECT_NAME"
echo "Project ID: $PROJECT_ID"
echo ""
echo "Opening Vercel dashboard..."
echo ""

# Try to open the browser
if command -v open &> /dev/null; then
    # macOS
    open "https://vercel.com/aidevelopers-projects/jits-coding-platform/settings/general"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "https://vercel.com/aidevelopers-projects/jits-coding-platform/settings/general"
elif command -v start &> /dev/null; then
    # Windows
    start "https://vercel.com/aidevelopers-projects/jits-coding-platform/settings/general"
else
    echo "Please open this URL in your browser:"
    echo "https://vercel.com/aidevelopers-projects/jits-coding-platform/settings/general"
fi

echo ""
echo "📋 Instructions:"
echo "1. In the 'General' settings page, scroll to 'Node.js Version'"
echo "2. Change from '24.x' to '18.x'"
echo "3. Click 'Save'"
echo ""
echo "After saving, run: npx vercel --prod"
echo ""


