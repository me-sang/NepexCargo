import { StorageService } from './base.storage';
import { LocalStorageService } from './local.storage';
import { S3StorageService } from './s3.storage';
import { env } from '../config/env.config';

export { StorageService } from './base.storage';
export { LocalStorageService } from './local.storage';
export { S3StorageService } from './s3.storage';

let _storageService: StorageService;

export function getStorageService(): StorageService {
  if (!_storageService) {
    _storageService = env.STORAGE_DRIVER === 's3'
      ? new S3StorageService()
      : new LocalStorageService();
  }
  return _storageService;
}
