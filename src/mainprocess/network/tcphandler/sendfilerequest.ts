const fs = require('fs');
const Int64 = require('node-int64');

const { BufferUtil } = require('../../utils/buffer');
const { StorageManager } = require('../../storage/storagemanager');

export class CmdSendFileRequest {
  private innerHandler = null;
  private remainderData = null;
  private stateIndex = 0;
  private states = [];

  private dataVer = -1;

  private fileName = null;
  private fileNameLen = 0;
  private hasThumbnail = false;
  private thumbnailLen = 0;
  private recvThumbnailLen = 0;
  private recvThumbnailFd = null;

  constructor(dataVer) {
    this.dataVer = dataVer;
    this.initStates();
  }

  public handle(data) {
    if (this.innerHandler == null) {
      if (this.stateIndex < this.states.length) {
        let state = this.states[this.stateIndex];
        state.handle(data);
      } else {
        console.log(`index out of states array, curr index: ${this.stateIndex}, states array length: ${this.states.length}`);
      }
    } else {
      this.innerHandler.handle(data);
    }
  }

  public end() {
    if (this.innerHandler != null) {
      this.innerHandler.end();
    }
    if (this.hasThumbnail) {
      console.log(`all received thumbnail length: ${this.recvThumbnailLen}`);
      if (this.recvThumbnailFd != null) {
        //console.log(`close fd: ${this.recvThumbnailFd}`);
        fs.closeSync(this.recvThumbnailFd);
        this.recvThumbnailFd = null;
      }
    }
  }

  // private methods

  private initStates() {
    this.stateIndex = 0;
    this.states.push({
      handle: this.fileNameLengthParser.bind(this)
    });
    this.states.push({
      handle: this.fileNameParser.bind(this)
    });
    this.states.push({
      handle: this.hasThumbnailParser.bind(this)
    });
    this.states.push({
      handle: this.thumbnailLengthParser.bind(this)
    });
    this.states.push({
      handle: this.thumbnailParser.bind(this)
    });
  }

  private fileNameLengthParser(data) {
    let expectLen = 4;
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return;
    }

    if (availableData.length >= expectLen) {
      this.fileNameLen = availableData.readInt32BE(0);
      console.log(`read file name length: ${this.fileNameLen}`);
      this.stateIndex += 1;
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(expectLen);
        this.handle(null);
      }
    } else {
      this.remainderData = availableData;
    }
  }

  private fileNameParser(data) {
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return;
    }

    if (availableData.length >= this.fileNameLen) {
      this.fileName = availableData.toString('utf8', 0, this.fileNameLen);
      console.log(`read file name: ${this.fileName}`);
      this.stateIndex += 1;
      if (availableData.length == this.fileNameLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(this.fileNameLen);
        this.handle(null);
      }
    } else {
      this.remainderData = availableData;
    }
  }

  private hasThumbnailParser(data) {
    let expectLen = 1;
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return;
    }

    if (availableData.length >= expectLen) {
      this.hasThumbnail = availableData.readInt8(0) == 1;
      console.log(`read has thumbnail: ${this.hasThumbnail}`);
      this.stateIndex += 1;
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(expectLen);
        this.handle(null);
      }
    } else {
      this.remainderData = availableData;
    }
  }

  private thumbnailLengthParser(data) {
    if (!this.hasThumbnail) {
      console.log('no need to parse thumbnail length, but there has more data');
      return;
    }
    let expectLen = 8;
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return;
    }

    if (availableData.length >= expectLen) {
      let int64 = new Int64(availableData, 0);
      this.thumbnailLen = int64.toNumber(true);
      console.log(`read thumbnail length: ${this.thumbnailLen}`);
      this.stateIndex += 1;
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(expectLen);
      }
      this.handle(this.remainderData);
      this.remainderData = null;
    } else {
      this.remainderData = availableData;
    }
  }

  private thumbnailParser(data) {
    if (!this.hasThumbnail) {
      console.log('no need to parse thumbnail, but there has more data');
      return;
    }
    if (this.recvThumbnailLen == 0) {
      this.recvThumbnailFd = fs.openSync(StorageManager.getDefaultStorePath(this.getThumbnailName()), 'wx');
      //console.log(`first write data, length: ${data.length}, recv fd: ${this.recvFd}`);
      fs.writeSync(this.recvThumbnailFd, data, 0, data.length);
    } else {
      //console.log(`write data, length: ${data.length}`);
      fs.writeSync(this.recvThumbnailFd, data, 0, data.length);
    }

    if (data != null) {
      this.recvThumbnailLen += data.length;
    }
  }

  private getThumbnailName(): string {
    return `thumbnail_${this.fileName}`;
  }
}
