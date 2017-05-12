const fs = require('fs');
const Int64 = require('node-int64');

import { AuthPhoneCmdHandler } from './authphonecmdhandler';
import { BufferUtil } from '../../utils/buffer';
import { StorageManager } from '../../storage/storagemanager';
import { Result, TcpCmdHandler } from '../tcpcmdhandler';
import { TcpRemoteInfo } from '../remoteinfo';

// Handle send file command from mobile device.
export class CmdSendFile extends AuthPhoneCmdHandler {
  private fileName = null;
  private fileNameLen = 0;
  private fileContentLen = 0;
  private recvFileLen = 0;
  private recvFd = null;

  constructor(rinfo: TcpRemoteInfo, dataVer, cmd) {
    super(rinfo, dataVer, cmd);
  }

  public end() {
    super.end();
    if (this.innerHandler != null) {
      this.innerHandler.end();
    }
    console.log(`all received file content length: ${this.recvFileLen}`);
    if (this.recvFd != null) {
      //console.log(`close fd: ${this.recvFd}`);
      fs.closeSync(this.recvFd);
      this.recvFd = null;
    }
  }

  protected onInitStates() {
    super.onInitStates();
    this.states.push({
      handle: this.fileNameLengthParser.bind(this),
      expectLen: () => { return 4; }
    });
    this.states.push({
      handle: this.fileNameParser.bind(this),
      expectLen: () => { return this.fileNameLen; }
    });
    this.states.push({
      handle: this.fileContentLengthParser.bind(this),
      expectLen: () => { return 8; }
    });
    this.states.push({
      handle: this.fileContentParser.bind(this),
      expectLen: () => { return -1; }
    });
  }

  // private methods

  private fileNameLengthParser(data: Buffer): Result {
    this.fileNameLen = data.readInt32BE(0);
    console.log(`read file name length: ${this.fileNameLen}`);
    return Result.Ok;
  }

  private fileNameParser(data: Buffer): Result {
    this.fileName = data.toString('utf8', 0, this.fileNameLen);
    console.log(`read file name: ${this.fileName}`);
    return Result.Ok;
  }

  private fileContentLengthParser(data: Buffer): Result {
    let int64 = new Int64(data, 0);
    this.fileContentLen = int64.toNumber(true);
    console.log(`read file content length: ${this.fileContentLen}`);
    return Result.Ok;
  }

  private fileContentParser(data: Buffer): Result {
    if (!this.recvFd) {
      this.recvFd = fs.openSync(StorageManager.getDefaultStorePath(this.fileName), 'wx');
      //console.log(`first write data, length: ${data.length}, recv fd: ${this.recvFd}`);
      fs.writeSync(this.recvFd, data, 0, data.length);
    } else {
      //console.log(`write data, length: ${data.length}`);
      fs.writeSync(this.recvFd, data, 0, data.length);
    }

    if (data != null) {
      this.recvFileLen += data.length;
      //console.log('recFile Len plus: ' + data.length + ', now is:' + this.recvFileLen);
    }
    if (this.recvFileLen == this.fileContentLen) {
      //console.log('recFileLen == fileContentLen, value:', this.recvFileLen);
      return Result.Ok;
    }
    return Result.MoreData;
  }
}
