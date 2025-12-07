#!/bin/bash

# Setup script to create .env file for local development

echo "Creating .env file..."

cat > .env << 'EOF'
# Database - MongoDB Atlas
DATABASE_URL=mongodb+srv://aideveloperindia_db_user:dTMeXZSFckyimshj@hackathon.chqxqsv.mongodb.net/jits_coding_platform?appName=Hackathon

# Backend
NODE_ENV=development
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-please-change-this-to-something-random

# Email Configuration - Gmail (for real email verification)
# Uncomment and set these if you want to use Gmail
# GMAIL_USER=aideveloperindia@gmail.com
# GMAIL_APP_PASSWORD=ljzwemumicdcpsku
# SMTP_FROM=aideveloperindia@gmail.com

# Alternative: MailHog for development (uncomment to use MailHog instead of Gmail)
# SMTP_HOST=mailhog
# SMTP_PORT=1025

# Frontend
FRONTEND_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:5001
EOF

echo "✅ .env file created successfully!"
echo ""
echo "Note: Email is optional. Registration will work even without email configuration."
echo "      In development, verification URLs will be logged to the console."




