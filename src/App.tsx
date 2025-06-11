import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import 'prismjs/themes/prism.css';

declare global {
  interface Window {
    electronAPI: {
      readAutosave: () => Promise<string>;
      saveAutosave: (c: string) => Promise<void>;
      openFile: () => Promise<{ content: string; path: string } | null>;
      getRecent: () => Promise<string[]>;
      saveFile: (content: string, path?: string) => Promise<{ path: string } | null>;
      readFile: (path: string) => Promise<{ content: string; path: string } | null>;
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

const NewFileIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v16h16V8l-6-4H4z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3v5h5" />
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
  saveFile: async () => null,
  readFile: async () => null,
};

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useState<'light' | 'dark'>(prefersDark ? 'dark' : 'light');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

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
      setCurrentPath(result.path);
      setRecent(await electronAPI.getRecent());
    }
  };

  const saveFile = async () => {
    const result = await electronAPI.saveFile(markdown, currentPath);
    if (result) {
      setCurrentPath(result.path);
      setRecent(await electronAPI.getRecent());
    }
  };

  const saveFileAs = async () => {
    const result = await electronAPI.saveFile(markdown, undefined);
    if (result) {
      setCurrentPath(result.path);
      setRecent(await electronAPI.getRecent());
    }
  };

  const newFile = () => {
    setMarkdown('');
    setCurrentPath(undefined);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.endsWith('.md')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setMarkdown(text);
        setCurrentPath(undefined);
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current++;
    setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  };

  const openRecent = async (p: string) => {
    const result = await electronAPI.readFile(p);
    if (result) {
      setMarkdown(result.content);
      setCurrentPath(result.path);
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
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium ml-2 shadow transition-colors"
          onClick={newFile}
        >
          <NewFileIcon /> New File
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium ml-2 shadow transition-colors"
          onClick={saveFile}
        >
          Save
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium ml-2 shadow transition-colors"
          onClick={saveFileAs}
        >
          Save As
        </button>
        <span className="ml-4 text-sm text-gray-700 dark:text-gray-300 truncate max-w-[12rem]">
          {currentPath ? currentPath.split(/[\\/]/).pop() : 'Untitled'}
        </span>
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
          <input
            type="file"
            accept=".md"
            ref={fileInputRef}
            onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            className={`drop-zone ${dragging ? 'dragging' : ''}`}
          >
            Drag and drop a <code>.md</code> file here or click to upload
          </div>
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
            <ReactMarkdown remarkPlugins={[gfm]} rehypePlugins={[rehypePrism]}>{markdown}</ReactMarkdown>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-2 border-t bg-white/80 dark:bg-gray-900/80 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
        <div>
          {recent.length > 0 && (
            <span>
              Recent:
              {recent.map((r, i) => (
                <button
                  key={r}
                  onClick={() => openRecent(r)}
                  className="ml-1 underline hover:text-blue-600"
                >
                  {i > 0 && ', '}
                  {r.split(/[\\/]/).pop()}
                </button>
              ))}
            </span>
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

