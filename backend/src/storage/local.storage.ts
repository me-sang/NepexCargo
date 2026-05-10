import fs from 'fs/promises';
import path from 'path';
import { StorageDriver, StorageFile, UploadResult } from './base.storage';
import { env } from '../config/env.config';

export class LocalStorageService implements StorageDriver {
  private readonly basePath: string;

  constructor() {
    this.basePath = path.resolve(env.LOCAL_STORAGE_PATH);
  }

  async upload(file: StorageFile, filePath: string): Promise<UploadResult> {
    const key = `${filePath}/${Date.now()}-${file.originalName}`;
    const fullPath = path.join(this.basePath, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file.buffer);
    return {
      key,
      url: `/files/${key}`,
      size: file.size,
      mimeType: file.mimeType,
    };
  }

  async delete(key: string): Promise<void> {
    await fs.unlink(path.join(this.basePath, key));
  }

  async getSignedUrl(key: string, _expiresInSeconds = 3600): Promise<string> {
    return `/files/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.basePath, key));
      return true;
    } catch {
      return false;
    }
  }
}
