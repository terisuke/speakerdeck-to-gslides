// Configuration file for SpeakerDeck to Google Slides Extension
// Copy this file to config.js and fill in your credentials

const CONFIG = {
  // Google Cloud OAuth 2.0 Client ID
  // Get this from https://console.cloud.google.com/apis/credentials
  CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  
  // Google Cloud Project Information (optional, for reference)
  PROJECT_NAME: 'Your Project Name',
  PROJECT_ID: 'your-project-id',
  PROJECT_NUMBER: 'your-project-number'
};

// Export for use in other files if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}