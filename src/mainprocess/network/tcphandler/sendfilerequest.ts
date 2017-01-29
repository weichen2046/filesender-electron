const { app } = require('electron');
const { config } = require('../definitions');
const dgram = require('dgram');
const fs = require('fs');
const Int64 = require('node-int64');
const notifier = require('node-notifier');
const { NetUtils } = require('../../utils/network/netutils');

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
        let res = this.parseData(data, state);
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
      expectLen: () => { return 4; }
    });
    this.states.push({
      handle: this.fileNameParser.bind(this),
      expectLen: () => { return this.fileNameLen; }
    });
    this.states.push({
      handle: this.hasThumbnailParser.bind(this),
      expectLen: () => { return 1; }
    });
    this.states.push({
      handle: this.thumbnailLengthParser.bind(this),
      expectLen: () => { return 8; },
      ignore: () => { return !this.hasThumbnail; }
    });
    this.states.push({
      handle: this.thumbnailParser.bind(this),
      ignore: () => { return !this.hasThumbnail; }
    });
  }

  private parseData(data, state): boolean {
    if (state.ignore !== undefined && state.ignore()) {
      //console.log('ignored state parse');
      return true;
    }

    let expectLen = state.expectLen !== undefined ? state.expectLen() : 0;
    //console.log('expect length:', expectLen);
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return false;
    }

    if (availableData.length >= expectLen) {
      let res = state.handle(availableData, state);
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(expectLen);
      }
      return res;
    } else {
      this.remainderData = availableData;
    }
    return false;
  }

  private fileNameLengthParser(data, state, expectLen) {
    this.fileNameLen = data.readInt32BE(0);
    console.log(`read file name length: ${this.fileNameLen}`);
    return true;
  }

  private fileNameParser(data, state) {
    this.fileName = data.toString('utf8', 0, this.fileNameLen);
    console.log(`read file name: ${this.fileName}`);
    return true;
  }

  private hasThumbnailParser(data, state) {
    this.hasThumbnail = data.readInt8(0) == 1;
    console.log(`read has thumbnail: ${this.hasThumbnail}`);
    return true;
  }

  private thumbnailLengthParser(data, state) {
    let int64 = new Int64(data, 0);
    this.thumbnailLen = int64.toNumber(true);
    console.log(`read thumbnail length: ${this.thumbnailLen}`);
    return true;
  }

  private thumbnailParser(data, state) {
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
	  this.sendRecvConfirm();
	  return;
	}
	this.sendRecvConfirm(false);
      });
    } else {
      console.log('other os nofication');
      notifier.notify({
	title: 'File receive confirm',
	message: this.fileName
      });
    }
  }

  private sendRecvConfirm(yes: boolean = true) {
    console.log('send confirm to phone:', yes);

    // TODO: get phone UDP listen port by ip address
    if (!config.phoneUdpPort) {
      console.log('has no phone UDP listen port');
      return;
    }

    let broadcastAddr = NetUtils.getIpV4BroadcastAddress();
    if (broadcastAddr === null) {
      console.log('Can not report PC info for broadcast address is null');
      return;
    }

    let client = dgram.createSocket('udp4');
    client.bind(() => {
      client.setBroadcast(true);
    });

    // 4 bytes data version
    // 4 bytes cmd
    // other bytes cmd data
    let dataLen = 4 + 4 + 4;
    let buffOffset = 0;
    let msg = Buffer.alloc(dataLen);
    msg.writeInt32BE(config.tcp.dataVer, buffOffset);
    buffOffset += 4;
    msg.writeInt32BE(config.cmd.pc.cmd_confirm_recv_file, buffOffset);
    buffOffset += 4;
    // TODO: write confirmed file identity
    msg.writeInt32BE(config.tcp.port, buffOffset);
    console.log(`send file receive confirm, port: ${config.phoneUdpPort}, broadcast address: ${broadcastAddr}`);
    client.send(msg, config.phoneUdpPort, broadcastAddr, (err) => {
      console.log('udp send finished close sock');
      client.close();
    });
  }
}
