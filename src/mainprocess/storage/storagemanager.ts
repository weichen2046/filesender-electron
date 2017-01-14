const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

export class StorageManager {
  public static getUserHome(): string {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  public static getDefaultStoreRootDir(): string {
    let userHome = StorageManager.getUserHome();
    return path.join(userHome, 'filesender', 'received');
  }

  public static getDefaultStoreDir(mkdirs: boolean) {
    let now = new Date();
    let year = now.getFullYear().toString();
    let month = (now.getMonth() + 1).toString();
    let root = StorageManager.getDefaultStoreRootDir();
    let defPath = path.join(root, year, month);
    if (mkdirs && !fs.existsSync(defPath)) {
      mkdirp.sync(defPath);
    }
    return defPath;
  }

  public static getDefaultStorePath(filename: string): string {
    let defaultStoreDir = StorageManager.getDefaultStoreDir(true);
    return path.join(defaultStoreDir, filename);
  }
}
