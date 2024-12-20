import * as vscode from 'vscode';


const handleShowMVCDiagram = (context: vscode.ExtensionContext, panel: vscode.WebviewPanel | undefined) => {
    context;
    console.log(context.extensionUri);
    
    if (panel) {
        panel.reveal();
    } else {
        panel = vscode.window.createWebviewPanel(
            'diagrammatic',
            'MVC Diagram',
            vscode.ViewColumn.One,
            {
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'dist')],
                enableScripts: true
            }
        );
    }

    panel.webview.html = getWebViewContent(context, panel);
    return panel;
};

const getWebViewContent = (context: vscode.ExtensionContext, panel: vscode.WebviewPanel) => {
    const webviewPath = vscode.Uri.joinPath(context.extensionUri, 'dist', 'webview');
    
    // const cssPath = vscode.Uri.joinPath(distPath, 'assets', 'style.css');
    const scriptPath = vscode.Uri.joinPath(webviewPath, 'webview.js');
    
    // const cssSrc = panel.webview.asWebviewUri(cssPath);
    const scriptSrc = panel.webview.asWebviewUri(scriptPath);

    return `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <link rel="icon" type="image/svg+xml" href="/vite.svg" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body>
            <div id="root"></div>
            <script src=${scriptSrc}></script>
        </body>
        </html>
    `;
};

export default handleShowMVCDiagram;