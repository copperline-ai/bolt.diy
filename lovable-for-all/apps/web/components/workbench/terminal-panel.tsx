"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

export function TerminalPanel({ projectId }: { projectId: string }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [command, setCommand] = useState("");

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      convertEol: true,
      theme: { background: "#0d0d0d", foreground: "#e6e6e6" },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln("Terminal ready. Type a command and press Enter.");

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws")}/api/projects/${projectId}/sandbox/terminal`,
    );

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onopen = () => {
      term.onData((data) => {
        ws.send(data);
      });
    };

    return () => {
      ws.close();
      term.dispose();
    };
  }, [projectId]);

  const runCommand = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/sandbox/execute`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });
    setCommand("");
  };

  return (
    <div className="flex flex-col rounded-lg border">
      <div className="border-b px-3 py-2 text-sm font-medium">Terminal</div>
      <div ref={terminalRef} className="flex-1 overflow-hidden p-2" />
      <div className="flex gap-2 border-t p-2">
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runCommand()}
          placeholder="Type command..."
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={runCommand}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Run
        </button>
      </div>
    </div>
  );
}
