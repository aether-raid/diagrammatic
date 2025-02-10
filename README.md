# Welcome to Diagrammatic

## Development Installation Guide

* **Install dependencies**: npm install
* **Start in VSCode extension mode**: Press F5
  * This will run the environment in watch mode (both the Extension & the React webview)
  * Ensure your local .vscode folder is using the one in this repo.
  * **To start the extension**:
    * Ctrl+Shift+P > Diagrammatic: Generate MVC Diagram

* **Start in browser**: npm run dev
  * Not integrated with the extension, so only mock data is available
  * Typically only used for developing solely the ReactFlow features

## Available Commands
**Generate MVC Diagram**
* Our main bread and butter :D
* Run this to generate a diagram of any given codebase
* Languages currently in development: JS, TS, Python, C++

**Select Ruleset**
* Define a custom ruleset to parse the AST returned by treesitter if you're unsatisfied with the default
* View config/default-rules.json for an example format

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

No external requirements.

Just npm install & run this on VSCode 

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

NIL

## Known Issues

NIL

## Release Notes

NIL, yet to release
