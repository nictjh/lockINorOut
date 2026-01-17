import * as vscode from 'vscode';

let overlayPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('Copilot Generation Overlay extension is now active!');

	// COMMENTED OUT: Manual toggle command
	// const toggleCommand = vscode.commands.registerCommand('copilot-generation-overlay.toggleOverlay', () => {
	// 	if (overlayPanel) {
	// 		hideGenerationOverlay();
	// 	} else {
	// 		showGenerationOverlay();
	// 	}
	// });
	// context.subscriptions.push(toggleCommand);

	// NEW: Intercept chat send to open overlay
	const chatSendCommand = vscode.commands.registerCommand('copilot-generation-overlay.chatSend', async () => {
		// 1️⃣ Fire the overlay immediately
		openOverlayImmediately();

		// 2️⃣ Forward to real chat send
		await vscode.commands.executeCommand('workbench.action.chat.submit');
	});

	context.subscriptions.push(chatSendCommand);
}

function openOverlayImmediately() {
	// Open the webview overlay
	showGenerationOverlay();

	// Also show status bar message
	vscode.window.setStatusBarMessage('🤖 AI is generating…', 2000);
}

function showGenerationOverlay() {
	if (overlayPanel) {
		overlayPanel.reveal();
		return;
	}

	overlayPanel = vscode.window.createWebviewPanel(
		'copilotOverlay',
		'FocusLock Feed',
		{
			viewColumn: vscode.ViewColumn.Active,
			preserveFocus: false
		},
		{
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: []
		}
	);

	overlayPanel.webview.html = getOverlayHtmlFromServer();

	// Handle messages from webview
	overlayPanel.webview.onDidReceiveMessage((message) => {
		if (message.command === 'close') {
			hideGenerationOverlay();
		}
	});

	overlayPanel.onDidDispose(() => {
		overlayPanel = undefined;
	});
}

function hideGenerationOverlay() {
	if (overlayPanel) {
		overlayPanel.dispose();
		overlayPanel = undefined;
		showCompletionPopup();
	}
}

function showCompletionPopup() {
	vscode.window.showInformationMessage(
		'✓ Copilot generation complete!',
		{ modal: false }
	);
}

function getOverlayHtmlFromServer(): string {
	const serverUrl = 'http://localhost:5173';
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>FocusLock Feed</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		html, body {
			width: 100%;
			height: 100%;
			margin: 0;
			padding: 0;
		}

		body {
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			overflow: hidden;
			background: transparent;
		}

		#iframe-container {
			display: flex;
			width: 100vw;
			height: 100vh;
			border: none;
		}

		iframe {
			flex: 1;
			border: none;
			width: 100%;
			height: 100%;
		}

		.loading {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(0, 0, 0, 0.05);
		}

		.spinner {
			width: 40px;
			height: 40px;
			border: 3px solid rgba(0, 0, 0, 0.1);
			border-top-color: #007acc;
			border-radius: 50%;
			animation: spin 1s linear infinite;
		}

		@keyframes spin {
			to {
				transform: rotate(360deg);
			}
		}

		.error-container {
			padding: 20px;
			color: #d32f2f;
		}

		.error-container code {
			background: #f5f5f5;
			padding: 2px 6px;
			border-radius: 3px;
			font-family: monospace;
		}
	</style>
</head>
<body>
	<div id="iframe-container">
		<div class="loading">
			<div class="spinner"></div>
		</div>
	</div>

	<script>
		const serverUrl = '${serverUrl}';
		let iframeCreated = false;

		function createIframe() {
			const container = document.getElementById('iframe-container');
			
			// Create iframe to load your game server
			const iframe = document.createElement('iframe');
			iframe.src = serverUrl;
			iframe.style.width = '100%';
			iframe.style.height = '100%';
			iframe.style.border = 'none';
			iframe.style.margin = '0';
			iframe.style.padding = '0';
			
			// Handle iframe load
			iframe.onload = () => {
				console.log('Feed loaded successfully');
				iframeCreated = true;
			};
			
			// Handle iframe errors
			iframe.onerror = () => {
				console.error('Failed to load iframe');
				showError('Failed to connect to server');
			};
			
			container.innerHTML = '';
			container.appendChild(iframe);
		}

		function showError(message) {
			const container = document.getElementById('iframe-container');
			container.innerHTML = \`
				<div class="error-container">
					<p><strong>Error loading feed</strong></p>
					<p>\${message}</p>
					<p style="margin-top: 10px;">Make sure your game dev server is running:</p>
					<code>cd game && npm run dev</code>
					<p style="margin-top: 10px; color: #666; font-size: 0.9em;">
						Server URL: <code>${serverUrl}</code>
					</p>
					<button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">
						Retry
					</button>
				</div>
			\`;
		}

		// Attempt to load iframe after a short delay
		setTimeout(() => {
			try {
				createIframe();
			} catch (error) {
				console.error('Error creating iframe:', error);
				showError(error.message);
			}
		}, 500);

		// Retry logic - check if server is reachable
		const checkServerInterval = setInterval(() => {
			if (!iframeCreated) {
				fetch(serverUrl, { method: 'HEAD' })
					.then(() => {
						console.log('Server is now reachable, reloading iframe');
						createIframe();
						clearInterval(checkServerInterval);
					})
					.catch(() => {
						console.log('Server still not reachable');
					});
			} else {
				clearInterval(checkServerInterval);
			}
		}, 2000);
	</script>
</body>
</html>`;
}

export function deactivate() {
	if (overlayPanel) {
		overlayPanel.dispose();
	}
}
