const dgram = require('dgram');
import { dialog } from 'electron';

import { config } from '../../network/config';
import { Phone } from '../phone';
import { Message } from '../msg';
import { AsyncMsgHandler } from './asyncmsghandler';

export class ShareFileHandler extends AsyncMsgHandler {
  private _phone: Phone;
  constructor(sender: Electron.WebContents) {
    super(sender);
  }

  public onParseArgs(msg: Message) {
    this._phone = msg.obj as Phone;
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
      this.sendSendingFileRequest(paths);
    });
  }

  private sendSendingFileRequest(paths: string[]) {
    // TODO: consider use tcp to send sending file request
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
