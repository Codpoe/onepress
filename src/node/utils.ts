import path from 'path';
import os from 'os';

export function slash(p: string): string {
  return p.replace(/\\/g, '/');
}

export const isWindows = os.platform() === 'win32';

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

export function cleanPath(id: string): string {
  return id.replace(/(\?|#).*/, '');
}
