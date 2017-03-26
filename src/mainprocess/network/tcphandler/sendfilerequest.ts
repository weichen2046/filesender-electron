const { app } = require('electron');
const dgram = require('dgram');
const fs = require('fs');
const Int64 = require('node-int64');
const notifier = require('node-notifier');

import { config } from '../config';
import { NetUtils } from '../../utils/network/netutils';
import { Phone } from '../../message/phone';
import { Runtime } from '../../runtime';
import { StorageManager } from '../../storage/storagemanager';
import { TcpCmdHandler } from '../tcpcmdhandler';
import { TcpRemoteInfo } from '../remoteinfo';

// Handle send file request command from mobile device.
export class CmdSendFileRequest extends TcpCmdHandler {
  private fileName = null;
  private fileNameLen = 0;
  private tokenLen = 0;
  private authToken = null;
  private fileId = -1;
  private hasThumbnail = false;
  private thumbnailLen = 0;
  private recvThumbnailLen = 0;
  private recvThumbnailFd = null;
  private _phone: Phone;

  constructor(dataVer, rinfo: TcpRemoteInfo) {
    super(rinfo);
    this.dataVer = dataVer;
    this.initStates();
  }

  public end() {
    super.end();
    //console.log('CmdSendFileRequest end called');
    if (this.hasThumbnail) {
      console.log(`all received thumbnail length: ${this.recvThumbnailLen}`);
      if (this.recvThumbnailFd != null) {
        //console.log(`close fd: ${this.recvThumbnailFd}`);
        fs.closeSync(this.recvThumbnailFd);
        this.recvThumbnailFd = null;
      }
    }
  }

  protected initStates() {
    super.initStates();
    this.states.push({
      handle: this.tokenLengthParser.bind(this),
      expectLen: () => { return 4; }
    });
    this.states.push({
      handle: this.authTokenParser.bind(this),
      expectLen: () => { return this.tokenLen; }
    });
    this.states.push({
      handle: this.fileNameLengthParser.bind(this),
      expectLen: () => { return 4; }
    });
    this.states.push({
      handle: this.fileNameParser.bind(this),
      expectLen: () => { return this.fileNameLen; }
    });
    this.states.push({
      handle: this.fileIdParser.bind(this),
      expectLen: () => { return 8; }
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

  protected allDataRecved() {
    //console.log('CmdSendFileRequest allDataRecved called');
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

  // private methods

  private tokenLengthParser(data, state): boolean {
    this.tokenLen = data.readInt32BE(0);
    console.log(`read auth token length: ${this.tokenLen}`);
    return true;
  }

  private authTokenParser(data, state): boolean {
    this.authToken = data.toString('utf8', 0, this.tokenLen);
    console.log(`read auth token: ${this.authToken}`);
    // authenticate with auth token
    this._phone = Runtime.instance.authenticatePhoneToken(this._remoteInfo.address, this.authToken);
    return !(!this._phone);
  }

  private fileNameLengthParser(data, state): boolean {
    this.fileNameLen = data.readInt32BE(0);
    console.log(`read file name length: ${this.fileNameLen}`);
    return true;
  }

  private fileNameParser(data, state): boolean {
    this.fileName = data.toString('utf8', 0, this.fileNameLen);
    console.log(`read file name: ${this.fileName}`);
    return true;
  }

  private fileIdParser(data, state): boolean {
    let int64 = new Int64(data, 0);
    this.fileId = int64.toNumber(true);
    console.log(`read file id: ${this.fileId}`);
    return true;
  }

  private hasThumbnailParser(data, state): boolean {
    this.hasThumbnail = data.readInt8(0) == 1;
    console.log(`read has thumbnail: ${this.hasThumbnail}`);
    return true;
  }

  private thumbnailLengthParser(data, state): boolean {
    let int64 = new Int64(data, 0);
    this.thumbnailLen = int64.toNumber(true);
    console.log(`read thumbnail length: ${this.thumbnailLen}`);
    return true;
  }

  private thumbnailParser(data, state): boolean {
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

  private sendRecvConfirm(yes: boolean = true) {
    console.log('send confirm to phone:', yes);

    let phone = this._phone;
    if (!phone) {
      console.log('phone authenticate failed when handle request send file cmd');
      return;
    }

    let client = dgram.createSocket('udp4');
    client.bind(() => {
      // 4 bytes data version
      // 4 bytes cmd
      // 1 bytes yes/no
      // 8 bytes file id
      let dataLen = 4 + 4 + 1 + 8;
      let buffOffset = 0;
      let msg = Buffer.alloc(dataLen);
      msg.writeInt32BE(config.tcp.dataVer, buffOffset);
      buffOffset += 4;
      msg.writeInt32BE(config.cmd.pc.cmd_confirm_recv_file, buffOffset);
      buffOffset += 4;
      msg.writeInt8(yes ? 1 : 0, buffOffset);
      buffOffset += 1;
      // write confirmed file identity
      msg.fill(new Int64(this.fileId).toBuffer(), buffOffset);
      //console.log(`send file receive confirm, port: ${phone.udpPort}, broadcast address: ${phone.address}`);
      client.send(msg, phone.udpPort, phone.address, (err) => {
        //console.log('udp send confirm file request finished, close sock');
        client.close();
        client = null;
      });
    });
  }
}
