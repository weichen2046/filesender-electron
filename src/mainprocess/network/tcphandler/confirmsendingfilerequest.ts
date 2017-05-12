const fs = require('fs');
const Int64 = require('node-int64');
const net = require('net');
const path = require('path');

import { AuthPhoneCmdHandler } from './authphonecmdhandler';
import { TcpRemoteInfo } from '../remoteinfo';
import { Result } from '../tcpcmdhandler';
import { Runtime } from '../../runtime';
import { PendingSendingFile } from '../../runtimex';
import { config } from '../../network/config';

export class CmdConfirmSendingFileRequest extends AuthPhoneCmdHandler {
  private accept: boolean;
  private fileIdCount: number;
  private fileIdArray: string[] = [];
  private _fileIdLengthArray: number[] = [];
  private _currIdPaserIndex = 0;

  private _sock;
  private _allDataSent = 0;
  private _currentSendingFileIndex = 0;
  private _paths: string[] = [];

  constructor(rinfo: TcpRemoteInfo, dataVer, cmd) {
    super(rinfo, dataVer, cmd);
  }

  protected onInitStates() {
    super.onInitStates();
    this.states.push({
      handle: this.acceptStateParser.bind(this),
      expectLen: () => { return 1; }
    });
    this.states.push({
      handle: this.fileIdCountParser.bind(this),
      expectLen: () => { return 4; },
      ignore: () => { return !this.accept; }
    });
  }

  protected allDataRecved() {
    console.log('allDataRecved, fileIds:', this.fileIdArray);
    if (this.fileIdArray.length > 0) {
      let pendingSendingFiles: PendingSendingFile[] = [];
      let runtime = Runtime.instance;
      // query file by file id from runtime
      this.fileIdArray.forEach(fileid => {
        let pendingFile = runtime.pendingFileManager.removePendingConfirmFile(fileid);
        if (pendingFile) {
          pendingSendingFiles.push(pendingFile);
          this._paths.push(pendingFile.filepath);
        }
      });
      console.log('pending sending files:', pendingSendingFiles);
      // send file to remote device
      setTimeout(() => {
        this.sendFiles(this._paths);
      }, 0);
    }
  }

  // private methods

  private acceptStateParser(data, state): Result {
    this.accept = data.readInt8(0) == 1;
    console.log(`read accept state: ${this.accept}`);
    return Result.Ok;
  }

  private fileIdCountParser(data, state): Result {
    this.fileIdCount = data.readInt32BE(0);
    console.log(`read file id count: ${this.fileIdCount}`);
    for(let i=0; i<this.fileIdCount; i++) {
      this.states.push({
        handle: this.fileIdLengthParser.bind(this),
        expectLen: () => { return 4; }
      });
      this.states.push({
        handle: this.fileIdParser.bind(this),
        expectLen: () => { return this._fileIdLengthArray[this._currIdPaserIndex]; }
      });
    }
    return Result.Ok;
  }

  private fileIdLengthParser(data, state): Result {
    let length = data.readInt32BE(0);
    console.log(`read file id[${this._currIdPaserIndex}] length: ${length}`);
    this._fileIdLengthArray[this._currIdPaserIndex] = length;
    return Result.Ok;
  }

  private fileIdParser(data, state): Result {
    let fileId = data.toString('utf8', 0, this._fileIdLengthArray[this._currIdPaserIndex]);
    console.log(`read file id[${this._currIdPaserIndex}]: ${fileId}`);
    this.fileIdArray[this._currIdPaserIndex] = fileId;
    this._currIdPaserIndex += 1;
    return Result.Ok;
  }

  private sendFiles(paths: string[]) {
    if (!this.authPhone.isAuthenticated()) {
      console.log('can not share file to unauthenticated phone');
      return;
    }

    let client = new net.Socket();
    this._sock = client;
    this._allDataSent = 0;
    client.connect(this.authPhone.tcpPort, this.authPhone.address, () => {
      console.log('send file tcp client connected');
      // 4 bytes data version
      // 4 bytes cmd
      // 4 bytes access token length
      // x bytes access token
      // 4 bytes file list length
      // 4 bytes Nth file name length
      // x bytes Nth file name
      // 4 bytes Nth file content length
      // x bytes Nth file content

      let phone = this.authPhone;
      let intBuff = Buffer.alloc(4);
      // write data version
      intBuff.writeInt32BE(config.tcp.dataVer, 0);
      client.write(intBuff);
      this._allDataSent += 4;
      // write cmd
      intBuff.writeInt32BE(config.cmd.pc.cmd_send_file, 0);
      client.write(intBuff);
      this._allDataSent += 4;
      // write access token length
      intBuff.writeInt32BE(phone.accessToken.length, 0);
      client.write(intBuff);
      this._allDataSent += 4;
      // write access token
      client.write(phone.accessToken);
      this._allDataSent += phone.accessToken.length;
      // write file list length
      intBuff.writeInt32BE(paths.length, 0);
      client.write(intBuff);
      this._allDataSent += 4;
      this.beginAsyncSendFileOrdered();
    });
    client.on('close', () => {
      console.log('send file tcp client closed, all data send:', this._allDataSent);
      client = null;
    });
  }

  private beginAsyncSendFileOrdered() {
    if (this._currentSendingFileIndex >= this._paths.length) {
      console.log(this._paths.length, 'files sent');
      return;
    }

    console.log(`send file[${this._currentSendingFileIndex}]: ${this._paths[this._currentSendingFileIndex]}`);
    let intBuff = Buffer.alloc(4);
    let client = this._sock;
    let fullpath = this._paths[this._currentSendingFileIndex];
    // get file name from path
    let filename = path.basename(fullpath);
    // write Nth filename length
    let fileNameLength = Buffer.byteLength(filename);
    intBuff.writeInt32BE(fileNameLength, 0);
    client.write(intBuff);
    this._allDataSent += 4;
    // write Nth file name
    client.write(filename);
    this._allDataSent += fileNameLength;
    // wirte Nth file content length
    let stats = fs.statSync(fullpath);
    let fileSizeInBytes = stats.size
    console.log('write path:', fullpath, 'file size:', fileSizeInBytes, 'file name length:', fileNameLength, 'file name:', filename);
    client.write(new Int64(fileSizeInBytes).toBuffer());
    this._allDataSent += 8;
    // write Nth file content
    let readStream = fs.createReadStream(fullpath);
    readStream.on('data', (chunk) => {
      client.write(chunk);
      this._allDataSent += chunk.length;
    });
    readStream.on('end', () => {
      //console.log('file send over:', fullpath);
      this._currentSendingFileIndex += 1;
      if (this._currentSendingFileIndex == this._paths.length) {
        client.end();
      } else {
        setTimeout(this.beginAsyncSendFileOrdered.bind(this), 0);
      }
    });
  }
}