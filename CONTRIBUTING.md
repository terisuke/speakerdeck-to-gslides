# Contributing to SpeakerDeck to Google Slides Converter

Thank you for your interest in contributing! We welcome contributions from the community.

## How to Contribute

### Reporting Issues

1. Check if the issue already exists
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and extension version

### Suggesting Features

1. Open a new issue with `[Feature Request]` prefix
2. Describe the feature and its benefits
3. Include use cases and examples

### Code Contributions

#### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/speakerdeck-to-gslides.git
   cd speakerdeck-to-gslides
   ```
3. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Process

1. Make your changes
2. Test thoroughly:
   - Load the extension in Chrome
   - Test with multiple SpeakerDeck URLs
   - Check console for errors
3. Follow the code style:
   - Use clear variable names
   - Add comments for complex logic
   - Keep functions focused and small

#### Submitting Pull Requests

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add feature: description"
   ```
2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Create a Pull Request with:
   - Clear title and description
   - Reference related issues
   - List of changes made
   - Screenshots/GIFs if UI changes

## Code Style Guidelines

### JavaScript

- Use ES6+ features where appropriate
- Use `const` and `let`, avoid `var`
- Use async/await over callbacks
- Add JSDoc comments for functions

Example:
```javascript
/**
 * Extracts slide data from the page
 * @param {number} timeout - Maximum wait time in ms
 * @returns {Promise<Array>} Array of slide objects
 */
async function extractSlideData(timeout = 5000) {
  // Implementation
}
```

### Naming Conventions

- Functions: camelCase (`extractSlideData`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- Classes: PascalCase (`SlideConverter`)
- Files: kebab-case (`service-worker.js`)

## Testing

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Convert button appears on SpeakerDeck pages
- [ ] Authentication flow works
- [ ] Slides are extracted correctly
- [ ] Google Slides creation succeeds
- [ ] Error messages are clear

### Test URLs

Test with various presentations:
- Short presentations (< 10 slides)
- Long presentations (> 50 slides)
- Japanese text presentations
- Presentations with special characters

## Project Structure

```
├── manifest.json         # Extension configuration
├── content.js           # DOM manipulation and data extraction
├── service-worker.js    # Background tasks and API calls
├── icons/               # Extension icons
└── docs/                # Documentation
```

### Key Files

- `content.js`: Handles page interaction and data extraction
- `service-worker.js`: Manages Google API calls
- `manifest.json`: Defines extension permissions and configuration

## Areas for Contribution

### High Priority
- [ ] Improve error handling and user feedback
- [ ] Add progress indicator for large presentations
- [ ] Optimize performance for 100+ slide presentations

### Nice to Have
- [ ] Add options page for user preferences
- [ ] Support for other presentation platforms
- [ ] Batch conversion capability
- [ ] Export format options

## Communication

- Use GitHub Issues for bugs and features
- Be respectful and constructive
- Follow the Code of Conduct

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue for any questions about contributing.

Thank you for helping make this extension better! 🎉