export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface StorageFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

import { env } from '../config/env.config';
import { LocalStorageService } from './local.storage';
import { S3StorageService } from './s3.storage';

export interface StorageDriver {
  upload(file: StorageFile, path: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  exists(key: string): Promise<boolean>;
}

// Concrete StorageService that delegates to the actual driver
export class StorageService implements StorageDriver {
  private driver: StorageDriver;

  constructor(driver?: StorageDriver) {
    if (driver) {
      this.driver = driver;
    } else if (env.STORAGE_DRIVER === 's3') {
      this.driver = new S3StorageService();
    } else {
      this.driver = new LocalStorageService();
    }
  }

  async upload(file: StorageFile, path: string): Promise<UploadResult> {
    return this.driver.upload(file, path);
  }

  async delete(key: string): Promise<void> {
    return this.driver.delete(key);
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return this.driver.getSignedUrl(key, expiresInSeconds);
  }

  async exists(key: string): Promise<boolean> {
    return this.driver.exists(key);
  }
}
