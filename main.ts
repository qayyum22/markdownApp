import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { readAutosave, saveAutosave, readFileContent, getRecent, addRecent } from './fileUtils';

let mainWindow: BrowserWindow | null = null;
let splash: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function createWindow() {
  splash = new BrowserWindow({ width: 400, height: 300, frame: false, alwaysOnTop: true });
  splash.loadFile(path.join(__dirname, 'public/splash.html'));

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }
  mainWindow.once('ready-to-show', () => {
    splash?.close();
    splash = null;
    mainWindow?.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('read-autosave', readAutosave);
ipcMain.handle('save-autosave', (_e, content) => saveAutosave(content));
ipcMain.handle('open-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ filters: [{ name: 'Markdown', extensions: ['md'] }], properties: ['openFile'] });
  if (canceled || filePaths.length === 0) return null;
  const content = await readFileContent(filePaths[0]);
  await addRecent(filePaths[0]);
  return { content, path: filePaths[0] };
});
ipcMain.handle('get-recent', getRecent);

