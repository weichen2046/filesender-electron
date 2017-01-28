const fs = require('fs');
const Int64 = require('node-int64');
const notifier = require('node-notifier')
const { app } = require('electron')

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
      //console.log('this stateIndex:', this.stateIndex);
      if (this.stateIndex < this.states.length) {
        let state = this.states[this.stateIndex];
        let res = state.handle(data, state);
	if (res) {
	  this.stateIndex += 1;
	  this.handle(null);
	}
      } else if (this.stateIndex == this.states.length) {
	this.allDataRecvedHandler();
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
      handle: this.fileNameLengthParser.bind(this),
      expectLen: 4,
      end: ''
    });
    this.states.push({
      handle: this.fileNameParser.bind(this),
      end: ''
    });
    this.states.push({
      handle: this.hasThumbnailParser.bind(this),
      expectLen: 1,
      end: ''
    });
    this.states.push({
      handle: this.thumbnailLengthParser.bind(this),
      expectLen: 8,
      end: ''
    });
    this.states.push({
      handle: this.thumbnailParser.bind(this),
      end: ''
    });
  }

  private fileNameLengthParser(data, state) {
    let expectLen = state.expectLen;
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return false;
    }

    if (availableData.length >= expectLen) {
      this.fileNameLen = availableData.readInt32BE(0);
      console.log(`read file name length: ${this.fileNameLen}`);
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(expectLen);
      }
      return true;
    } else {
      this.remainderData = availableData;
    }
    return false;
  }

  private fileNameParser(data, state) {
    let expectLen = this.fileNameLen;
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return false;
    }

    if (availableData.length >= expectLen) {
      this.fileName = availableData.toString('utf8', 0, expectLen);
      console.log(`read file name: ${this.fileName}`);
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(expectLen);
      }
      return true;
    } else {
      this.remainderData = availableData;
    }
    return false;
  }

  private hasThumbnailParser(data, state) {
    let expectLen = state.expectLen;
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return false;
    }

    if (availableData.length >= expectLen) {
      this.hasThumbnail = availableData.readInt8(0) == 1;
      console.log(`read has thumbnail: ${this.hasThumbnail}`);
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(expectLen);
      }
      return true;
    } else {
      this.remainderData = availableData;
    }
    return false;
  }

  private thumbnailLengthParser(data, state) {
    if (!this.hasThumbnail) {
      return true;
    }
    let expectLen = state.expectLen;
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return false;
    }

    if (availableData.length >= expectLen) {
      let int64 = new Int64(availableData, 0);
      this.thumbnailLen = int64.toNumber(true);
      console.log(`read thumbnail length: ${this.thumbnailLen}`);
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(expectLen);
      }
      return true;
    } else {
      this.remainderData = availableData;
    }
    return false;
  }

  private thumbnailParser(data, state) {
    if (!this.hasThumbnail) {
      return true;
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

    return this.recvThumbnailLen == this.thumbnailLen;
  }

  private getThumbnailName(): string {
    return `thumbnail_${this.fileName}`;
  }

  private allDataRecvedHandler() {
    if (process.platform == 'darwin') {
      console.log('darwin nofication center, curr path:', app.getAppPath());
      new notifier.NotificationCenter().notify({
	title: 'File receive confirm?',
	message: this.fileName,
	sound: 'Funk',
	closeLabel: 'Cancel',
	actions: 'Ok',
	icon: 'file://' + app.getAppPath() + '/dist/assets/png/256.png',
	wait: true,
	timeout: 10
      }, (err, resp, metadata) => {
	if (metadata.activationValue === 'Ok') {
	  // TODO: send confirm
	  console.log('send confirm to phone');
	}
      });
    } else {
      console.log('other os nofication');
      notifier.notify({
	title: 'File receive confirm',
	message: this.fileName
      });
    }
  }
}
