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

## Project Update Log

### What Was Done
- Updated the README.md file with current project instructions, including accurate local run commands (`npm run dev`), production build steps (`npm run build && npm run serve`), and tunnel exposure using ngrok.
- Committed the changes locally with message: "Update README with current local run instructions and project info".
- Attempted to push the commit to a personal GitHub fork.

### How It Was Done
- Read the existing README.md to understand its structure.
- Used terminal commands to rewrite the entire file content with updated sections, preserving screenshots and key features.
- Verified the package.json for accurate scripts and dependencies.
- Added the fork remote (`https://github.com/ankurrayvc/claudecodeCopilot.git`) to the git repository.
- Attempted push using HTTPS, then explored SSH options.

### Problems Faced
- Initial push to the original repository (`https://github.com/microsoft/mcp-interactiveUI-samples.git`) failed with "Permission denied to ankurray561" (403 error), as the user lacks write access to the upstream repo.
- HTTPS push to the fork also failed with the same permission error, indicating GitHub authentication was still using the wrong account credentials.
- SSH push attempts were blocked by passphrase prompts for the SSH key (`~/.ssh/id_ed25519`), and the SSH agent had no loaded identities.

### How Problems Were Solved
- Identified the need to push to a personal fork instead of the upstream repository.
- Configured a new git remote named "fork" pointing to the user's fork URL.
- For SSH issues, suggested loading the SSH key with `ssh-add ~/.ssh/id_ed25519` and retrying the push.
- As a fallback, recommended using HTTPS with correct GitHub credentials or a personal access token (PAT) for authentication.

### Complete Architecture
The project is an MCP (Model Context Protocol) App Server built with Node.js, Express, and TypeScript. It follows a stateless HTTP transport model for MCP communication.

#### Key Components:
- **Server Entry Point** (`main.ts`): Initializes the Express app with MCP SDK, sets up CORS, and handles MCP requests on `/mcp` endpoint. Uses StreamableHTTPServerTransport for stateless sessions.
- **Server Logic** (`server.ts`): Defines the MCP server instance, registers tools (e.g., `training-media`), and handles tool calls.
- **Tool Implementation** (`src/training-media/`): Contains the `training-media` tool logic, which recommends courses based on query, and renders UI widgets using React and Fluent UI.
- **UI Components** (`src/training-media/App.tsx`, `src/shared/FluentWrapper.tsx`): React components for course cards, video embeds, and fullscreen views. Built with Vite for bundling into single-file HTML.
- **Data Layer** (`mock-data/training-media.ts`): Static JSON data for courses, including titles, descriptions, videos, instructors, etc.
- **Build System**: Uses Vite for UI bundling (`build-ui.mjs`), TypeScript compilation, and concurrent dev server with watch mode.
- **Package Structure**: `appPackage/` contains Teams/Copilot integration files (manifest, AI plugin JSON).

#### Technologies:
- **Backend**: Node.js, Express, MCP SDK (@modelcontextprotocol/sdk), TypeScript.
- **Frontend**: React 19, Fluent UI v9 (@fluentui/react-components), Vite for build.
- **Dev Tools**: tsx for watch mode, concurrently for parallel tasks, cross-env for environment variables.
- **Deployment**: Stateless HTTP server, suitable for tunneling (ngrok) or cloud hosting.

### Data Flow
1. **User Prompt in Copilot/Teams**: User enters a prompt like "Recommend a training course about AI agents."
2. **MCP Tool Invocation**: Copilot calls the MCP server at the configured spec URL (e.g., `https://tunnel-url/mcp`).
3. **Server Request Handling**: Express app receives POST request on `/mcp`, creates a new McpServer instance per request (stateless).
4. **Tool Execution**: Server routes to `training-media` tool, which:
   - Parses query ("agents").
   - Filters/recommends courses from `mock-data/training-media.ts`.
   - Generates UI widget data (inline card or fullscreen view).
5. **UI Rendering**: Tool returns MCP response with UI component (React JSX serialized), including embedded video URLs, metadata, and interactive elements.
6. **Client Display**: Copilot renders the widget inline or in fullscreen, allowing user interaction (e.g., enroll button, video play).
7. **Response Closure**: Transport closes after response; no session persistence.

#### In-Depth Flow Details:
- **Stateless Design**: Each request is independent; no shared state between calls.
- **UI Bundling**: Vite bundles React components into single HTML files (`ui/training-media.html`), served statically or embedded in responses.
- **Error Handling**: Server catches errors, returns JSON-RPC error responses (code -32603).
- **CORS and Security**: CORS enabled for cross-origin requests; no authentication in this sample.
- **Performance**: UI assets rebuilt on changes in dev mode; production builds are optimized.

### Additional Notes
- **File Structure**: Root has `main.ts`, `server.ts`, `package.json`; `src/` for UI code; `mock-data/` for sample data; `appPackage/` for integration.
- **Customization**: Easily extend by adding tools in `server.ts`, updating data in `mock-data/`, or modifying UI in `src/`.
- **Testing**: Local dev with `npm run dev`, tunnel with ngrok, sideload in Teams for end-to-end testing.
- **Future Enhancements**: Add real API integrations, user authentication, database persistence, or more complex UI interactions.
