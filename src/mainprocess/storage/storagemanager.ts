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

  public static getDefaultStoreDir(mkdirs: boolean): string {
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
    let finalPath = path.join(defaultStoreDir, filename);
    while (fs.existsSync(finalPath)) {
      let parseRes = path.parse(filename);
      let name = parseRes.name;
      let ext = parseRes.ext;
      let patt = /\((\d+)\)$/;
      let match = name.match(patt);
      if (match) {
        let count = +match[1] + 1;
        filename = name.replace(patt, `(${count})`);
        filename = `${filename}${ext}`;
      } else {
        filename = `${name}(1)${ext}`;
      }
      finalPath = path.join(defaultStoreDir, filename);
    }
    return finalPath;
  }
}
