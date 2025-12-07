#!/bin/bash

# Vercel CLI Deployment Script
# This script helps deploy your JITS Coding Platform to Vercel

set -e

echo "🚀 JITS Coding Platform - Vercel Deployment"
echo "============================================"
echo ""

# Check if vercel CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed. Please install Node.js first."
    exit 1
fi

# Step 1: Check if logged in
echo "📋 Step 1: Checking Vercel authentication..."
if npx vercel whoami &> /dev/null; then
    echo "✅ Already logged in to Vercel"
    npx vercel whoami
else
    echo "⚠️  Not logged in. Please login first:"
    echo "   Run: npx vercel login"
    echo ""
    read -p "Press Enter after you've logged in, or Ctrl+C to cancel..."
fi

echo ""
echo "📋 Step 2: Linking project..."
if [ -d ".vercel" ]; then
    echo "✅ Project already linked"
else
    echo "🔗 Linking project to Vercel..."
    npx vercel link
fi

echo ""
echo "📋 Step 3: Checking environment variables..."
echo "⚠️  Make sure you've set these environment variables in Vercel:"
echo "   - DATABASE_URL"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET"
echo "   - GMAIL_USER"
echo "   - GMAIL_APP_PASSWORD"
echo "   - SMTP_FROM"
echo "   - FRONTEND_URL (set after first deployment)"
echo ""
read -p "Press Enter to continue with deployment, or Ctrl+C to set env vars first..."

echo ""
echo "📋 Step 4: Deploying to preview..."
echo "This will create a preview deployment for testing."
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx vercel
    echo ""
    echo "✅ Preview deployment complete!"
    echo ""
    echo "📋 Step 5: Deploy to production?"
    read -p "Deploy to production now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx vercel --prod
        echo ""
        echo "✅ Production deployment complete!"
        echo ""
        echo "🎉 Your app is now live!"
        echo "Don't forget to:"
        echo "1. Update FRONTEND_URL in Vercel environment variables"
        echo "2. Test your deployment"
    fi
else
    echo "Deployment cancelled."
fi

echo ""
echo "✨ Done!"



