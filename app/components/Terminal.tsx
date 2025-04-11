import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon>(new FitAddon());

  useEffect(() => {
    if (!terminalRef.current) return;

    // Configuration du terminal
    const term = new XTerm({
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#000000',
        foreground: '#ffffff',
      },
      cursorBlink: true,
      convertEol: true,
    });

    // Ajout du FitAddon
    term.loadAddon(fitAddonRef.current);
    
    // Ouverture du terminal
    term.open(terminalRef.current);
    xtermRef.current = term;
    
    // Ajustement initial
    fitAddonRef.current.fit();

    // Gestion du redimensionnement
    const handleResize = () => {
      fitAddonRef.current.fit();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Nettoyage
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div className="h-96 border rounded bg-black text-white overflow-hidden relative">
      <div 
        ref={terminalRef}
        className="absolute inset-0"
        style={{
          height: '100%',
          width: '100%'
        }}
      />
    </div>
  );
}

export default Terminal;