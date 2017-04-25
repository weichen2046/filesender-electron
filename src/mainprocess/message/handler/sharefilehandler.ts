const dgram = require('dgram');
const fs = require('fs');
const net = require('net');
const Int64 = require('node-int64');
import { dialog } from 'electron';

import { config } from '../../network/config';
import { Phone } from '../phone';
import { Message } from '../msg';
import { AsyncMsgHandler } from './asyncmsghandler';
import { IPhone } from "mainprocess/message/iphone";

export class ShareFileHandler extends AsyncMsgHandler {
  private _phone: Phone;
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
      // TODO: connect phone and share file
      // send file sending request
      // send file
      //this.sendSendingFileRequestTcp(paths);
      this.sendFile(paths);
    });
  }

  private sendFile(paths: string[]) {
    if (!this._phone.isAuthenticated()) {
      console.log('can not share file to unauthenticated phone');
      return;
    }

    let allDataLen = 0;
    let client = new net.Socket();
    client.connect(this._phone.tcpPort, this._phone.address, () => {
      console.log('send file tcp client connected');
      // 4 bytes data version
      // 4 bytes cmd
      // 4 bytes access token length
      // x bytes access token
      // 4 bytes paths length
      // 4 bytes Nth path length
      // x bytes Nth path
      // 4 bytes Nth file content length
      // x bytes Nth file content

      let phone = this._phone;
      let intBuff = Buffer.alloc(4);
      // write data version
      intBuff.writeInt32BE(config.tcp.dataVer, 0);
      client.write(intBuff);
      allDataLen += 4;
      // write cmd
      intBuff.writeInt32BE(config.cmd.pc.cmd_send_file, 0);
      client.write(intBuff);
      allDataLen += 4;
      // write access token length
      intBuff.writeInt32BE(phone.accessToken.length, 0);
      client.write(intBuff);
      allDataLen += 4;
      // write access token
      client.write(phone.accessToken);
      allDataLen += phone.accessToken.length;
      // write paths length
      intBuff.writeInt32BE(paths.length, 0);
      client.write(intBuff);
      allDataLen += 4;

      let pathsLen = paths.length;
      paths.forEach(path => {
        // write Nth path length
        intBuff.writeInt32BE(path.length, 0);
        client.write(intBuff);
        allDataLen += 4;
        // write Nth path name
        client.write(path);
        allDataLen += path.length;
        // wirte Nth file content length
        let stats = fs.statSync(path);
        let fileSizeInBytes = stats.size
        console.log('write path:', path, 'file size:', fileSizeInBytes);
        client.write(new Int64(fileSizeInBytes).toBuffer());
        allDataLen += 8;
        // write Nth file content
        let readStream = fs.createReadStream(path);
        readStream.on('data', (chunk) => {
          client.write(chunk);
          allDataLen += chunk.length;
        });
        readStream.on('end', () => {
          pathsLen -= 1;
          if (pathsLen == 0) {
            client.end();
          }
        });
      });
    });
    client.on('close', () => {
      console.log('send file tcp client closed, all data send:', allDataLen);
      client = null;
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
      // 4 bytes paths length
      // 4 bytes nth path length
      // x bytes nth path
      let phone = this._phone;
      let dataLen = 4 + 4 + 4 + phone.accessToken.length + 4;
      let allPathByteLen = 0;
      paths.forEach(path => {
        allPathByteLen += 4;
        allPathByteLen += path.length;
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
      paths.forEach(path => {
        // write nth path length
        msg.writeInt32BE(path.length, buffOffset);
        // write nth path
        buffOffset += 4;
        msg.write(path, buffOffset);
        buffOffset += path.length;
      });
      client.write(msg, () => {
        console.log(`client write ${dataLen} bytes`);
      });
      client.end();
    });
    client.on('close', () => {
      console.log('tcp client closed');
      client = null;
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
      paths.forEach(path => {
        allPathByteLen += 4;
        allPathByteLen += path.length;
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
      paths.forEach(path => {
        // write nth path length
        msg.writeInt32BE(path.length, buffOffset);
        // write nth path
        buffOffset += 4;
        msg.write(path, buffOffset);
        buffOffset += path.length;
      });
      client.send(msg, phone.udpPort, phone.address, (err) => {
        client.close();
        client = null;
      });
    });
  }
}
