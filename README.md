# SpeakerDeck to Google Slides Converter 🚀

A Chrome extension that converts SpeakerDeck presentations to Google Slides with just one click.

![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Google Slides API](https://img.shields.io/badge/Google%20Slides-API-yellow)

## ✨ Features

- **One-Click Conversion**: Convert any SpeakerDeck presentation to Google Slides instantly
- **High-Quality Images**: Preserves original slide image quality
- **Text Extraction**: Extracts and saves text content as speaker notes
- **Dynamic Content Support**: Handles dynamically loaded presentations
- **Japanese Support**: Full support for Japanese text without character encoding issues

## 📋 Prerequisites

- Google Chrome browser
- Google Cloud Project with Slides API enabled
- OAuth 2.0 Client ID for Chrome extension

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/speakerdeck-to-gslides.git
cd speakerdeck-to-gslides
```

### 2. Set Up Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google Slides API
4. Create OAuth 2.0 Client ID for Chrome Extension
5. Copy the Client ID

### 3. Configure the Extension

```bash
# Copy the example config
cp config.example.js config.js

# Edit config.js with your Client ID
# Or update manifest.json directly with your Client ID
```

### 4. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project folder

### 5. Test the Extension

1. Visit any SpeakerDeck presentation
2. Click the "📊 Convert to Google Slides" button
3. Authorize with Google (first time only)
4. Your presentation will be created!

## 📁 Project Structure

```
speakerdeck-to-gslides/
├── manifest.json           # Extension configuration
├── content.js             # Content script for data extraction
├── service-worker.js      # Background script for API calls
├── config.example.js      # Configuration template
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── setup_client_id.sh     # Setup helper script
└── README.md             # This file
```

## 🔧 Configuration

### manifest.json

Update the `oauth2.client_id` field with your Google Cloud Client ID:

```json
"oauth2": {
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/presentations",
    "https://www.googleapis.com/auth/drive.file"
  ]
}
```

### Permissions

The extension requires the following permissions:
- `scripting` - To inject content scripts
- `identity` - For Google OAuth authentication
- `storage` - To save user preferences (optional)

## 🎯 How It Works

1. **Data Extraction**: The content script extracts slide images and text from the Transcript section
2. **Authentication**: Uses Chrome Identity API for Google OAuth
3. **API Integration**: Service worker creates presentation via Google Slides API
4. **Batch Processing**: Efficiently adds multiple slides in batch requests

## ⚠️ Known Limitations

- **Hyperlinks**: Cannot extract clickable links due to iframe cross-origin restrictions
- **Animations**: Slide transitions and animations are not preserved
- **Private Presentations**: May not work with private or restricted presentations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development

### Setup Development Environment

```bash
# Install dependencies (if any)
npm install

# Run tests (if available)
npm test
```

### Debugging

1. Open Chrome DevTools on the SpeakerDeck page
2. Check Console for `[SpeakerDeck2GSlides]` logs
3. For service worker logs, click the service worker link in `chrome://extensions/`

## 🐛 Troubleshooting

### "Invalid Client ID" Error
- Verify the Client ID in manifest.json
- Ensure OAuth consent screen is configured

### "Transcript not found" Error
- Wait for the page to fully load
- Refresh the page and try again

### Authentication Issues
- Clear Chrome cache and cookies
- Re-authorize the extension

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors
- Built with Google Slides API
- Inspired by the need for seamless presentation conversion

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues before creating new ones

---

**Note**: This extension is not affiliated with SpeakerDeck or Google. It's an independent tool created to help users convert presentations.

Made with ❤️ for the presentation community