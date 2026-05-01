# Claude Copilot – Claude Code Terminal Inside Microsoft Copilot

## 📌 Project Overview

This project demonstrates how to embed **Claude AI** and an **interactive Claude Code terminal** directly inside **Microsoft 365 Copilot** using a custom Node.js backend, WebSocket server, and Copilot Studio declarative agents.

Inspired by [Andreas Adner's LinkedIn demo](https://www.linkedin.com/), this project brings a live Claude Code session into the Microsoft Copilot chat surface — typing, streaming output, the works.

The project focuses on:
- Building a Node.js Express + WebSocket backend that talks to Claude API
- Serving an interactive xterm.js terminal widget over HTTP
- Connecting the backend to Microsoft Copilot Studio via a Custom Connector
- Exposing the local server to the internet using ngrok
- Publishing the agent to Microsoft 365 Copilot

---

## 🧠 How It Works

```
User in M365 Copilot
        ↓
Copilot Studio Agent (claudecodeCopilot)
        ↓
Custom Connector (REST API) → ngrok tunnel
        ↓
Node.js Express Server (localhost:3001)
        ↓
Vantage Circle AI Proxy → Claude Haiku 4.5
```

For the terminal widget:
```
Browser opens /terminal
        ↓
xterm.js renders in browser
        ↓
WebSocket connects to Node.js server
        ↓
node-pty spawns a real /bin/zsh shell
        ↓
Bidirectional real-time terminal I/O
```

---

## 🗂️ Project Structure

```
claude-copilot/
├── server.js              # Express + WebSocket + Claude API server
├── terminal.html          # xterm.js interactive terminal UI
├── app.html               # Full chat UI with Adaptive Card support
├── package.json           # Node.js dependencies
├── package-lock.json      # Lock file
├── openapi.json           # OpenAPI spec for Custom Connector
├── README.md              # This file
└── node_modules/          # Installed packages
```

---

## ⚙️ Technologies Used

| Tool | Purpose |
|------|---------|
| Node.js + Express | HTTP server and REST API |
| WebSocket (ws) | Real-time bidirectional communication |
| node-pty | Spawns a real terminal (pseudo-TTY) |
| xterm.js | Terminal emulator in the browser |
| axios | HTTP client to call Claude API |
| cors | Cross-origin request handling |
| ngrok | Exposes localhost to the internet |
| Microsoft Copilot Studio | Agent builder and orchestrator |
| Microsoft 365 Copilot | End-user chat surface |
| Vantage Circle AI Proxy | Company proxy for Claude API access |

---

## 🔑 Authentication Setup

This project uses the **Vantage Circle internal AI proxy** instead of a direct Anthropic API key.

Claude Code was set up using:
```bash
mkdir -p ~/.claude && printf '%s
' '{' '  "env": {' '    "CLAUDE_CODE_USE_BEDROCK": "1",' '    "CLAUDE_CODE_SKIP_BEDROCK_AUTH": "1",' '    "AWS_REGION": "ap-northeast-1",' '    "ANTHROPIC_BEDROCK_BASE_URL": "https://ai-proxy.vantagecircle.com/bedrock",' '    "ANTHROPIC_AUTH_TOKEN": "YOUR_PROXY_KEY",' '    "ANTHROPIC_MODEL": "claude-haiku-4-5",' '    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "claude-haiku-4-5"' '  }' '}' > ~/.claude/settings.json
```

The same proxy key is used in `server.js` to call:
```
POST https://ai-proxy.vantagecircle.com/v1/messages
```

---

## 🛠️ Local Setup

### 1. Clone or download the project
```bash
cd ~/Desktop/claude-copilot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
node server.js
```

You should see:
```
✅ Server + WebSocket running on http://localhost:3001
✅ Terminal: http://localhost:3001/terminal
✅ Chat API: POST http://localhost:3001/chat
```

### 4. Test Claude is responding
```bash
curl -X POST http://localhost:3001/chat   -H "Content-Type: application/json"   -d '{"message": "Hello Claude"}'
```

Expected response:
```json
{"reply": "Hello! How can I help you today?"}
```

### 5. Test the terminal widget
Open in browser: `http://localhost:3001/terminal`

You should see a black terminal with a green connected dot.

---

## 🌐 Exposing to the Internet (ngrok)

Microsoft Copilot Studio runs in the cloud and cannot reach `localhost`. Use ngrok to create a public tunnel:

```bash
ngrok http 3001
```

You will get a URL like:
```
https://xxxx.ngrok-free.app
```

Use this URL when configuring the Custom Connector in Copilot Studio.

> ⚠️ ngrok URLs change every time you restart. Update the Custom Connector host whenever you get a new URL.

---

## 🤖 Copilot Studio Setup

### Step 1 — Create a Custom Connector
1. Go to `make.powerapps.com`
2. Click **Custom Connectors → New connector**
3. Set **Host** to your ngrok domain (without `https://`)
4. Add a POST action for `/chat` with body `{ "message": string }`
5. Click **Update connector`

### Step 2 — Create an Agent
1. Go to `copilotstudio.microsoft.com`
2. Click **Create → Agent**
3. Name it `claudecodeCopilot`
4. Add the custom connector as a Tool

### Step 3 — Add Instructions
In the agent's Instructions box, add:
```
You are claudecodeCopilot. When a user asks to open the terminal
or Claude Code, respond with a link to open the terminal.
For all other questions, use the Send a message to Claude tool.
```

### Step 4 — Publish
Click **Publish** to make the agent available in Microsoft 365 Copilot.

> ⚠️ Publishing requires a Copilot Studio license. Use an account with the appropriate Microsoft 365 Copilot license.

---

## 🖥️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server status |
| GET | `/terminal` | Interactive terminal UI |
| GET | `/app` | Full chat UI with Adaptive Cards |
| POST | `/chat` | Send message to Claude, get reply |
| WS | `ws://localhost:3001` | WebSocket for terminal I/O |

---

## 🚀 Features Built

- ✅ Claude AI answering questions inside Microsoft Copilot
- ✅ Interactive xterm.js terminal widget in browser
- ✅ Real shell access via node-pty (zsh)
- ✅ WebSocket bidirectional terminal streaming
- ✅ Adaptive Card terminal button in chat UI
- ✅ Custom chat webapp at `/app`
- ✅ Works with company AI proxy (no direct Anthropic key needed)

---

## ⚠️ Known Limitations

| Limitation | Reason | Workaround |
|-----------|--------|------------ |
| Terminal widget not embedded inside Copilot chat | Requires M365 Copilot full license + MCP Apps UI resource | Opens as a link in new tab |
| ngrok URL changes on restart | Free ngrok plan | Update Custom Connector host each time |
| API key is hardcoded | Quick prototype | Move to `.env` file for production |
| Server runs locally on Mac | No cloud hosting yet | Deploy to Azure/AWS for permanent setup |

---

## 🔮 Future Improvements

- [ ] Deploy server to Azure App Service (permanent URL, no ngrok needed)
- [ ] Move API key to `.env` file for security
- [ ] Embed terminal widget natively in M365 Copilot using MCP Apps UI resource
- [ ] Add Claude Code auto-launch inside terminal on connect
- [ ] Support multiple concurrent terminal sessions
- [ ] Add authentication to protect the terminal endpoint
- [ ] Stream Claude responses token by token (SSE/streaming)
- [ ] Move Copilot Studio agent to licensed account for full M365 publishing

---

## 👤 Author

**Ankur Ray**
- Company: Vantage Circle
- Built with: Claude Code + Microsoft Copilot Studio

---

> ⭐ This project was built as a proof of concept to demonstrate Claude AI integration inside Microsoft 365 Copilot using a local Node.js backend and ngrok tunneling.
