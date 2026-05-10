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

export abstract class StorageService {
  abstract upload(file: StorageFile, path: string): Promise<UploadResult>;
  abstract delete(key: string): Promise<void>;
  abstract getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  abstract exists(key: string): Promise<boolean>;
}
