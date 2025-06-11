import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

declare global {
  interface Window {
    electronAPI: {
      readAutosave: () => Promise<string>;
      saveAutosave: (c: string) => Promise<void>;
      openFile: () => Promise<{ content: string; path: string } | null>;
      getRecent: () => Promise<string[]>;
    };
  }
}

const AppIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <rect width="24" height="24" rx="6" fill="currentColor" className="text-blue-500 dark:text-blue-400"/>
    <path d="M7 17l5-10 5 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 13h7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const OpenIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
);

const ThemeIcon = ({ theme }: { theme: string }) => theme === 'dark' ? (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 4.05l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.05 19.95l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
) : (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
  </svg>
);

const electronAPI = window.electronAPI ?? {
  readAutosave: async () => '',
  saveAutosave: async () => {},
  openFile: async () => null,
  getRecent: async () => [],
};

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useState<'light' | 'dark'>(prefersDark ? 'dark' : 'light');

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    electronAPI.readAutosave().then(setMarkdown);
    electronAPI.getRecent().then(setRecent);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => electronAPI.saveAutosave(markdown), 500);
    return () => clearTimeout(id);
  }, [markdown]);

  const openFile = async () => {
    const result = await electronAPI.openFile();
    if (result) {
      setMarkdown(result.content);
      setRecent(await electronAPI.getRecent());
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-3 border-b bg-white/80 dark:bg-gray-900/80 shadow-sm sticky top-0 z-10">
        <AppIcon />
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100 select-none">MarkdownApp</h1>
        <div className="flex-1" />
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium shadow transition-colors"
          onClick={openFile}
        >
          <OpenIcon /> Open File
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium ml-2 shadow transition-colors"
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        >
          <ThemeIcon theme={theme} /> {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-0 md:gap-6 p-4 md:p-8 max-w-6xl w-full mx-auto">
        {/* Editor Panel */}
        <section className="flex-1 flex flex-col mb-4 md:mb-0">
          <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Markdown Input</label>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <textarea
              className="w-full h-full min-h-[300px] max-h-[70vh] p-4 text-base font-mono bg-transparent outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              placeholder="Type your markdown here..."
            />
          </div>
        </section>
        {/* Preview Panel */}
        <section className="flex-1 flex flex-col mt-6 md:mt-0">
          <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Preview</label>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-auto prose dark:prose-invert max-h-[70vh] p-6">
            <ReactMarkdown remarkPlugins={[gfm]}>{markdown}</ReactMarkdown>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-2 border-t bg-white/80 dark:bg-gray-900/80 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
        <div>
          {recent.length > 0 && (
            <span>Recent: {recent.map((r, i) => <span key={r}>{i > 0 && ', '}{r.split(/[\\/]/).pop()}</span>)}</span>
          )}
        </div>
        <a
          href="https://github.com/your-repo/markdownApp"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-blue-500 dark:text-blue-400"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
};

export default App;

