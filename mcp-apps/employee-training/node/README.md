# Employee Training (MCP App Server)

## Overview

This sample is a **Model Context Protocol (MCP) App Server** that recommends employee training courses and renders interactive course previews with embedded video. It uses React, Fluent UI v9, and the MCP Apps SDK to expose a tool UI for Copilot-style tool invocation and widget rendering.

Included tool:

- `training-media` — Course recommendation with inline entity card and fullscreen video experience

![Inline card](demos/screenshots/learningmedia-inline.png)

![Side-by-side view](demos/screenshots/learningmedia-sbs.png)

### Key features

- Course recommendation by topic
- Compact inline course cards with video preview
- Fullscreen course detail view with modules, instructor info, and related content
- Sample data in `mock-data/training-media.ts`

## Sample prompts

| Prompt | Expected behavior |
|---|---|
| Recommend a training course about AI agents. | Calls `training-media` with query `agents` and renders a matching course card. |
| Show me a course on Semantic Kernel. | Calls `training-media` with query `semantic kernel` and renders the course widget. |
| What training is available for Azure AI? | Calls `training-media` with query `azure ai` and returns a recommended course. |
| Suggest a learning resource for building copilots. | Calls `training-media` with query `copilot` and displays the course card. |

## Prerequisites

- Node.js 20+
- npm 10+

## Run locally

From `node/`:

```bash
npm install
npm run dev
```

- This launches the app server and rebuilds UI assets on file changes.
- The local MCP endpoint is:

```text
http://localhost:3001/mcp
```

### Build and serve for production

```bash
npm install
npm run build
npm run serve
```

## Expose with a tunnel

Example using ngrok:

```bash
ngrok http 3001
```

Then use the generated public URL with `/mcp` appended as your MCP spec endpoint.

## Test in Copilot / Teams

1. Open `appPackage/ai-plugin.json`.
2. Replace the MCP spec URL with your local tunnel endpoint.
3. Zip the `appPackage` folder.
4. Sideload the package into Teams.

If you're customizing tool definitions, use the M365 Agents Toolkit with your MCP server URL.

## Next steps

- Customize `mock-data/training-media.ts`
- Add new tools and UI widgets
- Extend the course recommendation experience
