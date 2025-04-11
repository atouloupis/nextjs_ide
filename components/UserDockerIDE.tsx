"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import type { Terminal as XTermTerminal } from "xterm";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface UserIDEProps {
  userName: string;
  accessToken: string;
}

type Language = "javascript" | "python";

export default function UserDockerIDE({ userName, accessToken }: UserIDEProps) {
  const [showIDE, setShowIDE] = useState(false);
  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState("// Write your JavaScript code here");
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTermTerminal | null>(null);

  useEffect(() => {
    let term: XTermTerminal | null = null;
    let socket: WebSocket | null = null;

    if (showIDE && terminalRef.current) {
      import("xterm").then(({ Terminal }) => {
        import("xterm/css/xterm.css");
        term = new Terminal({
          fontSize: 14,
          theme: {
            background: "#1e1e1e",
          },
        });
        term.open(terminalRef.current!);
        term.write("Connecting to backend shell...\r\n");
        xtermRef.current = term;

        term.onRender(() => {
          term?.scrollToBottom();
        });

        socket = new WebSocket("wss://expert-waddle-69wvxjg59973r947-3001.app.github.dev/");

        socket.onopen = () => {
          term?.write("Connected.\r\n");
          term?.onData((data) => {
            socket!.send(data);
          });
        };

        socket.onmessage = (event) => {
          term?.write(event.data);
          term?.scrollToBottom();
        };

        socket.onclose = () => {
          term?.write("\r\nConnection closed.\r\n");
        };

        socket.onerror = () => {
          term?.write("\r\nConnection error.\r\n");
        };
      });
    }

    return () => {
      if (term) {
        term.dispose();
        xtermRef.current = null;
      }
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [showIDE]);

  useEffect(() => {
    const saved = localStorage.getItem(`ide_code_${userName}_${language}`);
    if (saved) setCode(saved);
    else {
      setCode(language === "python" ? "# Write your Python code here" : "// Write your JavaScript code here");
    }
  }, [userName, language]);

  const handleChange = (value: string | undefined) => {
    setCode(value || "");
    localStorage.setItem(`ide_code_${userName}_${language}`, value || "");
  };

  const [pyodide, setPyodide] = useState<any>(null);
  useEffect(() => {
    if (language === "python" && !pyodide) {
      const loadPyodideInstance = async () => {
        const pyodideModule = await (window as any).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
        });
        setPyodide(pyodideModule);
      };

      if (!(window as any).loadPyodidePromise) {
        (window as any).loadPyodidePromise = new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
          script.onload = () => {
            resolve();
          };
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      (window as any).loadPyodidePromise
        .then(() => {
          loadPyodideInstance();
        })
        .catch((err: any) => {
          console.error("Failed to load Pyodide script", err);
        });
    }
  }, [language, pyodide]);

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="border rounded px-2 py-1"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <Button onClick={() => setShowIDE(true)}>Start IDE</Button>
        <Button onClick={() => setShowIDE(false)} variant="outline">
          Stop IDE
        </Button>
        <Button
          onClick={() => {
            if (xtermRef.current) {
              xtermRef.current.focus();
              xtermRef.current.write(code + "\r");
            }
          }}
          variant="default"
        >
          Run Code
        </Button>
      </div>
      {showIDE && (
        <div className="flex flex-col gap-2">
          <div className="h-[400px] border rounded">
            <MonacoEditor
              height="100%"
              defaultLanguage={language}
              language={language}
              defaultValue={code}
              value={code}
              onChange={handleChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                wordWrap: "on",
              }}
            />
          </div>
          <div className="h-[200px] border rounded bg-black text-white overflow-hidden relative">
            <div ref={terminalRef} 
                className="absolute inset-0 overflow-hidden" 
                style={
                  {
                    '--xterm-screen-max-height': '100%',
                    '--xterm-screen-max-width': '100%'
                  } as React.CSSProperties
                }
                />
          </div>
        </div>
      )}
    </div>
  );
}
