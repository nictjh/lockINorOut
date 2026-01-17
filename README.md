# Copilot Generation Overlay

A VS Code extension that displays a visual overlay while Copilot is generating code, and shows a notification when generation is complete.

## Features

- **Generation Overlay**: Displays a semi-transparent overlay with a spinner when Copilot starts generating code
- **Completion Notification**: Shows a popup notification when generation is finished
- **Auto-detection**: Automatically detects when Copilot is actively generating completions
- **Manual Control**: Commands to manually show/hide the overlay for testing

## How It Works

The extension monitors inline completion requests (used by GitHub Copilot) and:

1. **Shows the overlay** when it detects Copilot is starting to generate
2. **Tracks generation progress** by monitoring text document changes
3. **Hides the overlay** and **displays a notification** when generation completes

## Usage

### Automatic Detection

Once installed and activated, the extension automatically:
- Detects when Copilot starts generating (e.g., when you trigger inline completions)
- Displays the overlay with a loading spinner
- Removes the overlay when generation completes and shows a completion notification

### Manual Commands

You can also manually trigger the overlay for testing:

- **Show Overlay**: Run command `Copilot Generation Overlay: Show Copilot Generation Overlay`
- **Hide Overlay**: Run command `Copilot Generation Overlay: Hide Copilot Generation Overlay`

To access these commands, use `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) to open the Command Palette.

## Customization

The overlay can be customized by modifying the `getOverlayHtml()` function in `src/extension.ts`:

- Change the background color/opacity
- Modify the spinner style
- Update the text messages
- Adjust animations

## Requirements

- VS Code 1.108.1 or higher
- GitHub Copilot extension (optional - overlay will still work with other inline completion providers)

## Extension Settings

Currently, this extension has no configurable settings. Future versions may include:
- Overlay appearance customization
- Notification behavior options
- Detection sensitivity adjustments

## Known Limitations

- The extension detects generation based on completion requests and text changes
- May not detect every Copilot interaction depending on your VS Code version
- Overlay detection is based on timing heuristics

## Development

### Building the Extension

```bash
npm install
npm run compile
```

### Running in Debug Mode

Press `F5` or go to **Run > Start Debugging** to launch the extension in a new VS Code window.

### Testing

```bash
npm test
```

## Release Notes

### 1.0.0

Initial release with:
- Automatic overlay detection for Copilot generation
- Completion notification popup
- Manual show/hide commands
- Customizable overlay UI

## License

MIT
