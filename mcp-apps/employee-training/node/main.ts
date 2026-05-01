/**
 * Entry point for the MCP server.
 * Streamable HTTP transport (stateless mode) + WebSocket terminal.
 */
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import type { Request, Response } from "express";
import { WebSocketServer } from "ws";
import pty from "node-pty";
import { createServer } from "./server.js";

export async function startStreamableHTTPServer(
  createServerFn: () => McpServer,
): Promise<void> {
  const port = parseInt(process.env.PORT ?? "3001", 10);

  const app = createMcpExpressApp({ host: "0.0.0.0" });
  app.use(cors());

  app.get("/", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      message: "Claude Terminal MCP server is running",
      mcpEndpoint: "/mcp",
      websocketEndpoint: "/terminal-ws",
    });
  });

  app.all("/mcp", async (req: Request, res: Response) => {
    const server = createServerFn();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  const httpServer = app.listen(port, () => {
    console.log(`\n🚀 MCP App Server listening on http://localhost:${port}/mcp\n`);
    console.log("Available tools:");
    console.log("  • training-media      — AI course recommendation with video preview");
    console.log("  • claude-terminal     — Open Claude Code terminal widget\n");
    console.log(`Terminal WebSocket listening on ws://localhost:${port}/terminal-ws\n`);
  });

  const wss = new WebSocketServer({
    server: httpServer,
    path: "/terminal-ws",
  });

  wss.on("connection", (ws) => {
    console.log("✅ Claude terminal widget connected");

    let terminalProcess: pty.IPty | undefined;

    try {
      terminalProcess = pty.spawn("/bin/zsh", ["-i"], {
        name: "xterm-256color",
        cols: 100,
        rows: 30,
        cwd: process.env.HOME || "/Users/ankurray",
        env: {
          ...process.env,
          TERM: "xterm-256color",
          SHELL: "/bin/zsh",
          PATH: "/opt/homebrew/bin:/opt/homebrew/opt/node@22/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
        },
      });

      terminalProcess.onData((data) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              type: "output",
              data,
            }),
          );
        }
      });

      ws.on("message", (message) => {
        try {
          const parsed = JSON.parse(message.toString());

          if (parsed.type === "input") {
            terminalProcess?.write(parsed.data);
          }

          if (parsed.type === "resize") {
            terminalProcess?.resize(parsed.cols, parsed.rows);
          }
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      });

      ws.on("close", () => {
        console.log("❌ Claude terminal widget disconnected");
        terminalProcess?.kill();
      });
    } catch (error) {
      console.error("Failed to start terminal:", error);

      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            type: "output",
            data: "\r\nFailed to start terminal.\r\n",
          }),
        );
      }

      ws.close();
    }
  });

  const shutdown = () => {
    console.log("\nShutting down...");
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startStreamableHTTPServer(createServer).catch((e) => {
  console.error(e);
  process.exit(1);
});