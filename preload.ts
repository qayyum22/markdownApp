import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  readAutosave: () => ipcRenderer.invoke('read-autosave'),
  saveAutosave: (content: string) => ipcRenderer.invoke('save-autosave', content),
  openFile: () => ipcRenderer.invoke('open-file'),
  getRecent: () => ipcRenderer.invoke('get-recent'),
  saveFile: (content: string, filePath?: string) => ipcRenderer.invoke('save-file', { filePath, content }),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath)
});
