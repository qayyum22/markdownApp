import { promises as fs } from 'fs';
import path from 'path';
import { app } from 'electron';

function getUserDir(): string {
  return app.getPath('userData');
}

function getAutosavePath(): string {
  return path.join(getUserDir(), 'autosave.md');
}

function getRecentPath(): string {
  return path.join(getUserDir(), 'recent.json');
}

export async function readAutosave(): Promise<string> {
  try {
    return await fs.readFile(getAutosavePath(), 'utf-8');
  } catch {
    return '';
  }
}

export async function saveAutosave(content: string): Promise<void> {
  try {
    await fs.writeFile(getAutosavePath(), content, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to save autosave: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function readFileContent(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to read file: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function saveFileContent(filePath: string, content: string): Promise<void> {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to write file: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getRecent(): Promise<string[]> {
  try {
    const data = await fs.readFile(getRecentPath(), 'utf-8');
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
  await fs.writeFile(getRecentPath(), JSON.stringify(recents), 'utf-8');
}
