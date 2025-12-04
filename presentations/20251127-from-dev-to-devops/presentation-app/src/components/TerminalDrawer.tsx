import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface TerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function TerminalDrawer({ isOpen, onClose, title, content }: TerminalDrawerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[80vh] bg-[#0d1117] border-t-2 border-[var(--secondary)] rounded-t-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Terminal header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
              <div className="flex items-center gap-3">
                {/* Mac-style buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all"
                  />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>

                <div className="flex items-center gap-2 text-[var(--secondary)] ml-4">
                  <Terminal size={16} />
                  <span className="font-pixel text-xs">DATA_LOG.md</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleCopy}
                  className="p-2 hover:bg-[#30363d] rounded transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  whileTap={{ scale: 0.9 }}
                >
                  {copied ? <Check size={16} className="text-[var(--secondary)]" /> : <Copy size={16} />}
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-[#30363d] rounded transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            {/* Terminal title bar */}
            <div className="px-4 py-2 bg-[#0d1117] border-b border-[#30363d] text-[var(--secondary)] font-mono text-sm">
              <span className="text-[var(--text-muted)]">$ cat</span> {title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 terminal-text">
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="scanlines" />
              </div>

              {/* Matrix-style header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 text-[var(--secondary)] font-pixel text-sm"
              >
                {'// '}TECHNICAL SPECS :: {title.toUpperCase()}
              </motion.div>

              {/* Markdown content */}
              <div className="prose prose-invert prose-green max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-pixel text-[var(--primary)] mb-4 mt-8">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-[var(--secondary)] mb-3 mt-6 border-b border-[#30363d] pb-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-[var(--primary-glow)] mb-2 mt-4">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-[#8b949e] mb-4 leading-relaxed">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-[var(--secondary)] font-semibold">{children}</strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-none space-y-2 mb-4 ml-4">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-[#8b949e] flex items-start gap-2">
                        <span className="text-[var(--secondary)] mt-1">{'>'}</span>
                        <span>{children}</span>
                      </li>
                    ),
                    code: ({ className, children }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="bg-[#161b22] text-[var(--secondary)] px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="block bg-[#161b22] rounded-lg p-4 overflow-x-auto text-sm border border-[#30363d]">
                          <pre className="text-[#c9d1d9]">{children}</pre>
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <div className="relative group my-4">
                        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[#161b22] border border-[#30363d] rounded text-xs text-[var(--text-muted)] font-pixel">
                          CODE
                        </div>
                        {children}
                      </div>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-[var(--primary)] pl-4 italic text-[#8b949e] my-4">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-4 border-t border-[#30363d] text-[var(--text-muted)] text-sm"
              >
                <span className="text-[var(--secondary)]">$</span> _
                <span className="animate-pulse">|</span>
              </motion.div>
            </div>

            {/* Bottom hint */}
            <div className="px-4 py-2 bg-[#161b22] border-t border-[#30363d] text-center">
              <span className="text-[var(--text-muted)] text-xs">
                Press <kbd className="bg-[#30363d] px-1.5 py-0.5 rounded text-[var(--text-secondary)] mx-1">ESC</kbd> or <kbd className="bg-[#30363d] px-1.5 py-0.5 rounded text-[var(--text-secondary)] mx-1">T</kbd> to close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
