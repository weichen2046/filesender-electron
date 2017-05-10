const uuid = require('uuid');

export class PendingSendingFile {
  filename: string;
  fileid: string;
  addtime: number;

  public constructor(filename: string) {
    this.filename = filename;
    this.fileid = uuid.v1().replace(/-/g, '');
  }
}

export class PendingSendingFileManager {
  private static TIMEOUT = 30 * 1000; // 30s
  pendingfiles = {};

  // return added pending file id
  public addPendingFile(filename: string): string {
    let pendingFile = new PendingSendingFile(filename);
    if (this.pendingfiles[pendingFile.fileid]) {
      console.log('warning, pending file exist already, file id:', pendingFile.fileid, 'file name:', filename);
    }
    pendingFile.addtime = new Date().getTime();
    this.pendingfiles[pendingFile.fileid] = pendingFile;
    return pendingFile.fileid;
  }

  // remove pending file by id, true if removed file count more than 0
  public removePendingFile(fileid: string): boolean {
    let pendingFile = this.pendingfiles[fileid];
    if (pendingFile) {
      delete this.pendingfiles[fileid];
      return true;
    }
    return false;
  }

  // return the removed file count
  public removeOutOfDatePendingFiles(): number {
    let timestamp = new Date().getTime();
    let toDelKeys = [];
    for (let k in this.pendingfiles) {
      if (this.pendingfiles.hasOwnProperty(k)) {
        let pendingFile: PendingSendingFile = this.pendingfiles[k];
        if ((timestamp - pendingFile.addtime) >= PendingSendingFileManager.TIMEOUT) {
          toDelKeys.push(k);
        }
      }
    }
    toDelKeys.forEach(key => {
      delete this.pendingfiles[key];
    });
    return toDelKeys.length;
  }

  public sendDelayMessage() {
    setTimeout(() => {
      //console.log('before remove out of date dump files:');
      //this.dump();
      this.removeOutOfDatePendingFiles();
      //console.log('after remove out of date dump files:');
      //this.dump();
    }, PendingSendingFileManager.TIMEOUT);
  }

  public dump() {
    if (Object.keys(this.pendingfiles).length == 0) {
      console.log('no pending files');
      return;
    }
    let index = 0;
    for (let key in this.pendingfiles) {
      console.log(`pending file[${index}]: ${this.pendingfiles[key].filename}`);
      index++;
    }
  }
}