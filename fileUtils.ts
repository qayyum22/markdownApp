import { promises as fs } from 'fs';
import path from 'path';
import { app } from 'electron';

const userDir = app.getPath('userData');
const autosavePath = path.join(userDir, 'autosave.md');
const recentPath = path.join(userDir, 'recent.json');

export async function readAutosave(): Promise<string> {
  try {
    return await fs.readFile(autosavePath, 'utf-8');
  } catch {
    return '';
  }
}

export async function saveAutosave(content: string): Promise<void> {
  await fs.writeFile(autosavePath, content, 'utf-8');
}

export async function readFileContent(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function getRecent(): Promise<string[]> {
  try {
    const data = await fs.readFile(recentPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function addRecent(filePath: string): Promise<void> {
  const recents = await getRecent();
  const index = recents.indexOf(filePath);
  if (index !== -1) recents.splice(index, 1);
  recents.unshift(filePath);
  if (recents.length > 10) recents.pop();
  await fs.writeFile(recentPath, JSON.stringify(recents), 'utf-8');
}
