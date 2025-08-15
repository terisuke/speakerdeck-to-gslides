#!/bin/bash

# SpeakerDeck to Google Slides - Client ID Setup Script
# This script helps you configure the Google Cloud Client ID

echo "================================================"
echo " SpeakerDeck to Google Slides - Setup Script"
echo "================================================"
echo ""
echo "Google Cloud Project Information:"
echo "- Project Name: subscriptionHP"
echo "- Project ID: subscriptionhp"
echo "- Project Number: 555983015085"
echo ""

# Check if manifest.json exists
if [ ! -f "manifest.json" ]; then
    echo "Error: manifest.json not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Prompt for Client ID
echo "Please enter your Google Cloud OAuth 2.0 Client ID:"
echo "(Format: XXXXXXXXXX.apps.googleusercontent.com)"
read -p "Client ID: " CLIENT_ID

# Validate Client ID format
if [[ ! "$CLIENT_ID" =~ \.apps\.googleusercontent\.com$ ]]; then
    echo "Error: Invalid Client ID format!"
    echo "Expected format: XXXXXXXXXX.apps.googleusercontent.com"
    exit 1
fi

# Create backup of manifest.json
cp manifest.json manifest.json.backup
echo "Backup created: manifest.json.backup"

# Update manifest.json with the Client ID
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/YOUR_CLIENT_ID\.apps\.googleusercontent\.com/$CLIENT_ID/g" manifest.json
else
    # Linux
    sed -i "s/YOUR_CLIENT_ID\.apps\.googleusercontent\.com/$CLIENT_ID/g" manifest.json
fi

# Verify the update
if grep -q "$CLIENT_ID" manifest.json; then
    echo ""
    echo "✅ Success! Client ID has been configured."
    echo ""
    echo "Next steps:"
    echo "1. Open Chrome and go to chrome://extensions"
    echo "2. Enable Developer Mode"
    echo "3. Click 'Load unpacked' and select this folder"
    echo "4. Test on: https://speakerdeck.com/terisuke/01"
    echo ""
    echo "For detailed instructions, see INTEGRATION_TEST.md"
else
    echo "Error: Failed to update manifest.json"
    echo "Please update it manually."
    exit 1
fi