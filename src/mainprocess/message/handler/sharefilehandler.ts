const dgram = require('dgram');
const fs = require('fs');
const net = require('net');
const Int64 = require('node-int64');
const path = require('path');
import { dialog } from 'electron';

import { config } from '../../network/config';
import { Phone } from '../phone';
import { Message } from '../msg';
import { AsyncMsgHandler } from './asyncmsghandler';
import { IPhone } from "mainprocess/message/iphone";
import { Runtime } from '../../runtime';

export class ShareFileHandler extends AsyncMsgHandler {
  private _phone: Phone;
  private _paths: string[];
  private _currentSendingFileIndex = 0;
  private _sock;
  private _allDataSent = 0;

  constructor(sender: Electron.WebContents) {
    super(sender);
  }

  public onParseArgs(msg: Message) {
    this._phone = Phone.parseFrom(msg.obj as IPhone);
  }

  public onHandle() {
    dialog.showOpenDialog({
      title: 'Select File To Share',
      properties: ['openFile', 'multiSelections']
    }, (paths) => {
      //console.log('selected paths:', paths, 'phone:', this._phone);
      // send file sending request
      this._paths = paths;
      this.sendSendingFileRequestTcp(paths);
    });
  }

  private sendSendingFileRequestTcp(paths: string[]) {
    if (!this._phone.isAuthenticated()) {
      console.log('can not share file to unauthenticated phone');
      return;
    }
    let client = new net.Socket();
    client.connect(this._phone.tcpPort, this._phone.address, () => {
      console.log('tcp client connected');
      // 4 bytes data version
      // 4 bytes cmd
      // 4 bytes access token length
      // x bytes access token
      // 4 bytes file list length
      // 4 bytes nth file name length
      // x bytes nth file name

      let phone = this._phone;
      let intBuff = Buffer.alloc(4);
      // write data version
      intBuff.writeInt32BE(config.tcp.dataVer, 0);
      client.write(intBuff);
      this._allDataSent += 4;
      // write cmd
      intBuff.writeInt32BE(config.cmd.pc.cmd_sending_file_request, 0);
      client.write(intBuff);
      this._allDataSent += 4;
      // write access token length
      //console.log('use phone access token to send file request:', phone.accessToken);
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

      let runtime = Runtime.instance;
      paths.forEach(fullpath => {
        // get file name from path
        let filename = path.basename(fullpath);
        let fileid = runtime.pendingFileManager.addPendingConfirmFile(filename, fullpath);
        // write Nth file name length
        let fileNameLength = Buffer.byteLength(filename);
        intBuff.writeInt32BE(fileNameLength, 0);
        client.write(intBuff);
        this._allDataSent += 4;
        // write Nth file name
        client.write(filename);
        this._allDataSent += fileNameLength;
        // write Nth file id length
        intBuff.writeInt32BE(fileid.length, 0);
        client.write(intBuff);
        this._allDataSent += 4;
        // write Nth file id
        client.write(fileid);
        this._allDataSent += fileid.length;
      });
      runtime.pendingFileManager.sendDelayMessage();
      client.end();
    });
    client.on('close', () => {
      console.log('send file request tcp client closed, all data send:', this._allDataSent);
      client = null;
    });
  }

  private sendFiles(paths: string[]) {
    if (!this._phone.isAuthenticated()) {
      console.log('can not share file to unauthenticated phone');
      return;
    }

    let client = new net.Socket();
    this._sock = client;
    client.connect(this._phone.tcpPort, this._phone.address, () => {
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

      let phone = this._phone;
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
      this.asyncSendFileOrdered();
    });
    client.on('close', () => {
      console.log('send file tcp client closed, all data send:', this._allDataSent);
      client = null;
    });
  }

  private asyncSendFileOrdered() {
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
      this._currentSendingFileIndex += 1;
      if (this._currentSendingFileIndex == this._paths.length) {
        client.end();
      } else {
        setTimeout(this.asyncSendFileOrdered.bind(this), 0);
      }
    });
  }

  private sendSendingFileRequestUdp(paths: string[]) {
    let client = dgram.createSocket('udp4');
    client.bind(() => {
      // 4 bytes data version
      // 4 bytes cmd
      // 4 bytes access token length
      // x bytes access token
      // 4 bytes paths length
      // 4 bytes nth path length
      // x bytes nth path
      let phone = this._phone;
      let dataLen = 4 + 4 + 4 + phone.accessToken.length + 4;
      let allPathByteLen = 0;
      paths.forEach(fullpath => {
        allPathByteLen += 4;
        allPathByteLen += fullpath.length;
      });
      dataLen += allPathByteLen;
      let msg = Buffer.alloc(dataLen);
      // write version
      let buffOffset = 0;
      msg.writeInt32BE(config.tcp.dataVer, buffOffset);
      // write cmd
      buffOffset += 4;
      msg.writeInt32BE(config.cmd.pc.cmd_sending_file_request, buffOffset);
      // write access token length
      buffOffset += 4;
      msg.writeInt32BE(phone.accessToken.length, buffOffset);
      // write access token
      buffOffset += 4;
      msg.write(phone.accessToken, buffOffset);
      // write paths length
      buffOffset += phone.accessToken.length;
      msg.writeInt32BE(paths.length, buffOffset);

      buffOffset += 4;
      paths.forEach(fullpath => {
        // write nth path length
        msg.writeInt32BE(fullpath.length, buffOffset);
        // write nth path
        buffOffset += 4;
        msg.write(fullpath, buffOffset);
        buffOffset += fullpath.length;
      });
      client.send(msg, phone.udpPort, phone.address, (err) => {
        client.close();
        client = null;
      });
    });
  }
}
