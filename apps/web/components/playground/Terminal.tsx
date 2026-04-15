"use client";
import { useEffect, useRef } from 'react';

interface TerminalProps {
  onMount?: (term: any) => void;
}

export default function Terminal({ onMount }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!terminalRef.current || initialized.current) return;
    initialized.current = true;

    const initTerminal = async () => {
      const { Terminal: XTerminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');

      const term = new XTerminal({
        theme: {
          background: '#0a0a0a',
          foreground: '#e4e4e7',
          cursor: '#a1a1aa',
          selectionBackground: 'rgba(255, 255, 255, 0.2)',
          black: '#18181b',
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#3b82f6',
          magenta: '#a855f7',
          cyan: '#06b6d4',
          white: '#f4f4f5',
          brightBlack: '#52525b',
          brightRed: '#f87171',
          brightGreen: '#4ade80',
          brightYellow: '#facc15',
          brightBlue: '#60a5fa',
          brightMagenta: '#c084fc',
          brightCyan: '#22d3ee',
          brightWhite: '#ffffff',
        },
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
        fontSize: 13,
        lineHeight: 1.5,
        cursorBlink: true,
        cursorStyle: 'bar',
        convertEol: true,
        allowProposedApi: true,
        scrollback: 1000,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      fitAddonRef.current = fitAddon;

      term.open(terminalRef.current!);
      
      // Delay fit to ensure container is rendered
      setTimeout(() => fitAddon.fit(), 10);

      term.writeln('\x1b[1;36m╭─────────────────────────────────────╮\x1b[0m');
      term.writeln('\x1b[1;36m│\x1b[0m  \x1b[1;32m✓\x1b[0m Terminal Ready                \x1b[1;36m│\x1b[0m');
      term.writeln('\x1b[1;36m│\x1b[0m  Press Run or Ctrl+Enter to execute \x1b[1;36m│\x1b[0m');
      term.writeln('\x1b[1;36m╰─────────────────────────────────────╯\x1b[0m');
      term.writeln('');

      xtermRef.current = term;

      if (onMount) {
        onMount(term);
      }
    };

    initTerminal();

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(() => fitAddonRef.current?.fit(), 10);
    });
    
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      xtermRef.current?.dispose();
    };
  }, [onMount]);

  return (
    <div 
      ref={terminalRef} 
      className="w-full h-full bg-[#0a0a0a] p-2"
      style={{ minHeight: '100px' }}
    />
  );
}
