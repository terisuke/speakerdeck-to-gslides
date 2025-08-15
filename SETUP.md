# Setup Guide 🛠️

This guide will walk you through setting up the SpeakerDeck to Google Slides Chrome Extension.

## Prerequisites

- Google Chrome Browser
- Google Account
- Basic knowledge of Chrome Extensions

## Step 1: Google Cloud Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "speakerdeck-converter")
4. Note your Project ID

### 1.2 Enable Google Slides API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Slides API"
3. Click on it and press "Enable"

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required fields
   - Add scopes:
     - `https://www.googleapis.com/auth/presentations`
     - `https://www.googleapis.com/auth/drive.file`
4. For Application type, select "Chrome Extension"
5. Enter your extension ID (you'll get this after loading the unpacked extension)
6. Copy the generated Client ID

## Step 2: Configure the Extension

### 2.1 Update Client ID

#### Option A: Direct Edit
Edit `manifest.json` and replace the placeholder:

```json
"oauth2": {
  "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
  ...
}
```

#### Option B: Using Setup Script
```bash
# Make the script executable
chmod +x setup_client_id.sh

# Run the setup script
./setup_client_id.sh

# Enter your Client ID when prompted
```

### 2.2 Create Config File (Optional)

```bash
# Copy the example config
cp config.example.js config.js

# Edit config.js with your credentials
nano config.js  # or use your preferred editor
```

## Step 3: Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `speakerdeck-to-gslides` folder
5. The extension will appear in your extensions list
6. Note the Extension ID shown

## Step 4: Update Extension ID in Google Cloud

1. Go back to Google Cloud Console
2. Navigate to your OAuth 2.0 Client ID settings
3. Update the Extension ID field with the ID from Step 3.6
4. Save changes

## Step 5: Test the Extension

1. Navigate to a SpeakerDeck presentation:
   - Example: `https://speakerdeck.com/username/presentation-name`
2. Look for the "📊 Convert to Google Slides" button (top right)
3. Click the button
4. Authorize with Google (first time only)
5. Wait for the conversion to complete
6. The new Google Slides presentation will open automatically

## Troubleshooting

### Extension Not Loading
- Check that all files are present (manifest.json, content.js, service-worker.js)
- Verify manifest.json is valid JSON
- Check Chrome DevTools console for errors

### Authentication Errors
- Ensure Client ID is correctly formatted
- Verify OAuth consent screen is configured
- Check that required APIs are enabled

### Conversion Fails
- Check if the presentation is public
- Ensure Transcript section is available
- Look for errors in the console

### "Invalid Client ID" Error
```bash
# Verify the Client ID format
grep "client_id" manifest.json

# Should show: "client_id": "NUMBERS-RANDOM.apps.googleusercontent.com"
```

## Development Tips

### Enable Debug Logging
Add `?debug=true` to any SpeakerDeck URL to enable verbose logging:
```
https://speakerdeck.com/username/presentation?debug=true
```

### View Service Worker Logs
1. Go to `chrome://extensions/`
2. Find your extension
3. Click "service worker" link
4. DevTools will open with console logs

### Reload Extension After Changes
1. Go to `chrome://extensions/`
2. Click the reload icon on your extension card
3. Refresh the SpeakerDeck page

## Security Best Practices

- Never commit `config.js` with real credentials
- Use `.gitignore` to exclude sensitive files
- Keep your Client ID private
- Regularly review OAuth permissions

## Next Steps

- Read the [README](README.md) for feature overview
- Check [CONTRIBUTING](CONTRIBUTING.md) to contribute
- Report issues on GitHub

---

Need help? Open an issue on GitHub with:
- Error messages
- Steps to reproduce
- Chrome version
- Extension version