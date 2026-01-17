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
		'Copilot Generating',
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			retainContextWhenHidden: true
		}
	);

	overlayPanel.webview.html = getOverlayHtml();

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

function getOverlayHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Copilot Generating...</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			width: 100vw;
			height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(0, 0, 0, 0.7);
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			overflow: hidden;
		}

		.overlay-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 2rem;
			padding: 2rem;
		}

		.spinner {
			width: 60px;
			height: 60px;
			border: 4px solid rgba(255, 255, 255, 0.3);
			border-top-color: #fff;
			border-radius: 50%;
			animation: spin 1s linear infinite;
		}

		@keyframes spin {
			to {
				transform: rotate(360deg);
			}
		}

		.text {
			color: #fff;
			font-size: 1.2rem;
			text-align: center;
		}

		.status {
			color: rgba(255, 255, 255, 0.8);
			font-size: 0.95rem;
			margin-top: 0.5rem;
		}

		.pulse-dot {
			display: inline-block;
			width: 8px;
			height: 8px;
			background: #4CAF50;
			border-radius: 50%;
			margin: 0 0.3rem;
			animation: pulse 1.5s ease-in-out infinite;
		}

		@keyframes pulse {
			0%, 100% {
				opacity: 1;
				transform: scale(1);
			}
			50% {
				opacity: 0.5;
				transform: scale(1.2);
			}
		}

		.close-btn {
			position: absolute;
			bottom: 2rem;
			padding: 0.75rem 1.5rem;
			background: rgba(255, 255, 255, 0.2);
			color: #fff;
			border: 1px solid rgba(255, 255, 255, 0.4);
			border-radius: 4px;
			cursor: pointer;
			font-size: 0.9rem;
			transition: all 0.3s ease;
		}

		.close-btn:hover {
			background: rgba(255, 255, 255, 0.3);
			border-color: rgba(255, 255, 255, 0.6);
		}
	</style>
</head>
<body>
	<div class="overlay-container">
		<div class="spinner"></div>
		<div class="text">
			Copilot is generating...
			<div class="status">
				<span class="pulse-dot"></span>
				Processing your request
				<span class="pulse-dot"></span>
			</div>
		</div>
	</div>
	<button class="close-btn" onclick="closeOverlay()">Close (or press Cmd+Shift+G)</button>

	<script>
		const vscode = acquireVsCodeApi();

		function closeOverlay() {
			vscode.postMessage({ command: 'close' });
		}

		// Also allow Escape key to close
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				closeOverlay();
			}
		});
	</script>
</body>
</html>`;
}

export function deactivate() {
	if (overlayPanel) {
		overlayPanel.dispose();
	}
}
