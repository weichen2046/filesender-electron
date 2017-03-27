const { app } = require('electron');
const dgram = require('dgram');
const fs = require('fs');
const Int64 = require('node-int64');
const notifier = require('node-notifier');

import { AuthPhoneCmdHandler } from './authphonecmdhandler';
import { config } from '../config';
import { NetUtils } from '../../utils/network/netutils';
import { Phone } from '../../message/phone';
import { Runtime } from '../../runtime';
import { StorageManager } from '../../storage/storagemanager';
import { Result, TcpCmdHandler } from '../tcpcmdhandler';
import { TcpRemoteInfo } from '../remoteinfo';

// Handle send file request command from mobile device.
export class CmdSendFileRequest extends AuthPhoneCmdHandler {
  private fileName = null;
  private fileNameLen = 0;
  private fileId = -1;
  private hasThumbnail = false;
  private thumbnailLen = 0;
  private recvThumbnailLen = 0;
  private recvThumbnailFd = null;

  constructor(rinfo: TcpRemoteInfo, dataVer, cmd) {
    super(rinfo, dataVer, cmd);
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

  private fileNameLengthParser(data, state): Result {
    this.fileNameLen = data.readInt32BE(0);
    console.log(`read file name length: ${this.fileNameLen}`);
    return Result.Ok;
  }

  private fileNameParser(data, state): Result {
    this.fileName = data.toString('utf8', 0, this.fileNameLen);
    console.log(`read file name: ${this.fileName}`);
    return Result.Ok;
  }

  private fileIdParser(data, state): Result {
    let int64 = new Int64(data, 0);
    this.fileId = int64.toNumber(true);
    console.log(`read file id: ${this.fileId}`);
    return Result.Ok;
  }

  private hasThumbnailParser(data, state): Result {
    this.hasThumbnail = data.readInt8(0) == 1;
    console.log(`read has thumbnail: ${this.hasThumbnail}`);
    return Result.Ok;
  }

  private thumbnailLengthParser(data, state): Result {
    let int64 = new Int64(data, 0);
    this.thumbnailLen = int64.toNumber(true);
    console.log(`read thumbnail length: ${this.thumbnailLen}`);
    return Result.Ok;
  }

  private thumbnailParser(data, state): Result {
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

    if (this.recvThumbnailLen == this.thumbnailLen) {
      return Result.Ok;
    } else {
      return Result.Abort;
    }
  }

  private getThumbnailName(): string {
    return `thumbnail_${this.fileName}`;
  }

  private sendRecvConfirm(yes: boolean = true) {
    console.log('send confirm to phone:', yes);

    let phone = this.authPhone;
    if (!phone) {
      console.log('phone authenticate failed when handle request send file cmd');
      return;
    }

    let client = dgram.createSocket('udp4');
    client.bind(() => {
      // 4 bytes data version
      // 4 bytes cmd
      // 4 bytes access token length
      // x bytes access token
      // 1 bytes yes/no
      // 8 bytes file id
      let dataLen = 4 + 4 + 4 + phone.accessToken.length + 1 + 8;
      let msg = Buffer.alloc(dataLen);
      // write version
      let buffOffset = 0;
      msg.writeInt32BE(config.tcp.dataVer, buffOffset);
      // write cmd
      buffOffset += 4;
      msg.writeInt32BE(config.cmd.pc.cmd_confirm_recv_file, buffOffset);
      // write access token length
      buffOffset += 4;
      msg.writeInt32BE(phone.accessToken.length, buffOffset);
      // write access token
      buffOffset += 4;
      msg.write(phone.accessToken, buffOffset);
      // write yes/no
      buffOffset += phone.accessToken.length;
      msg.writeInt8(yes ? 1 : 0, buffOffset);
      // write file id
      buffOffset += 1;
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
