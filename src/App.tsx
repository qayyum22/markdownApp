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
    window.electronAPI.readAutosave().then(setMarkdown);
    window.electronAPI.getRecent().then(setRecent);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => window.electronAPI.saveAutosave(markdown), 500);
    return () => clearTimeout(id);
  }, [markdown]);

  const openFile = async () => {
    const result = await window.electronAPI.openFile();
    if (result) {
      setMarkdown(result.content);
      setRecent(await window.electronAPI.getRecent());
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-2 flex gap-2 border-b bg-gray-200 dark:bg-gray-700">
        <button className="px-2 py-1 border rounded" onClick={openFile}>Open</button>
        <button className="px-2 py-1 border rounded" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>Toggle Theme</button>
      </div>
      <div className="flex flex-1">
        <textarea
          className="w-1/2 p-2 border-r resize-none bg-white dark:bg-gray-800 outline-none"
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
        />
        <div className="w-1/2 p-4 overflow-auto prose dark:prose-invert">
          <ReactMarkdown remarkPlugins={[gfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
      {recent.length > 0 && (
        <div className="p-2 text-xs border-t bg-gray-100 dark:bg-gray-800">
          Recent: {recent.join(', ')}
        </div>
      )}
    </div>
  );
};

export default App;

