import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import '../styles/terminal.css';

const TerminalComponent = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (terminalRef.current) {
      const terminal = new Terminal({
        cursorBlink: true,
        theme: {
          background: '#1e1e1e'
        }
      });
      
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      
      terminal.open(terminalRef.current);
      fitAddon.fit();
      
      // Ajuster la taille lors du redimensionnement
      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      
      resizeObserver.observe(terminalRef.current);
      
      return () => {
        terminal.dispose();
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div className="terminal-container">
      <div ref={terminalRef} className="terminal" />
    </div>
  );
};

export default TerminalComponent;
