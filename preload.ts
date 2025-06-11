import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  readAutosave: () => ipcRenderer.invoke('read-autosave'),
  saveAutosave: (content: string) => ipcRenderer.invoke('save-autosave', content),
  openFile: () => ipcRenderer.invoke('open-file'),
  getRecent: () => ipcRenderer.invoke('get-recent')
});
