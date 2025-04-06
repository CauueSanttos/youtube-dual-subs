# YouTube Dual Subtitles

A Chrome extension that displays subtitles in two languages simultaneously on YouTube, making it easier to learn foreign languages.

<p align="center">
  <img src="public/icon-cc.png" alt="YouTube Dual Subtitles" width="128" height="128">
</p>

## Features

- **Dual subtitles**: Displays original and translated subtitles simultaneously
- **Integrated toggle button**: Enable/disable dual subtitles directly in the YouTube interface
- **Automatic translation**: Translates subtitles in real-time as you watch
- **YouTube controls preservation**: Keeps the original YouTube interface intact
- **Persistent navigation**: Works even when navigating between different YouTube videos

## Installation

### From the Chrome Web Store (coming soon)

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (link to be updated)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual installation (for developers)

1. Clone this repository:
   ```
   git clone https://github.com/YOUR_USERNAME/youtube-dual-subs.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the extension:
   ```
   npm run build
   ```

4. In Chrome, go to `chrome://extensions/`
5. Enable "Developer mode" in the top right corner
6. Click "Load unpacked"
7. Select the `dist` folder generated in step 3

## How to use

1. Go to any YouTube video
2. Enable native YouTube captions (the "cc" button)
3. Click the "DS" button in the video controls to enable/disable dual subtitles
   - When enabled, the button will be red
   - When disabled, the button will be white

## Configuration

By default, the extension translates from English (en) to Portuguese (pt). To change the languages:

1. Click on the extension icon in the Chrome toolbar
2. Select the source and target languages in the popup
3. Your settings will be saved automatically

## Keyboard shortcuts

- `d`: Enable/disable dual subtitles

## Compatibility

- Google Chrome (version 88+)
- Microsoft Edge (Chromium-based)
- Brave Browser
- Opera

## Known issues

- The extension depends on YouTube's native captions. If a video doesn't have captions, the translation functionality won't be available.
- In some videos, there might be a slight delay in synchronizing the translation with the original captions.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## Privacy Policy

We take your privacy seriously. YouTube Dual Subtitles:
- Does not collect personal identifiable information
- Does not track your browsing history
- Stores your preferences only locally in your browser

Read our complete [Privacy Policy](PRIVACY_POLICY.md) to learn more about how we handle your data.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- Special thanks to all contributors and testers who helped improve this extension.
