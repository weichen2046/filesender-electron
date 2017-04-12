const exec = require('child_process').exec

import * as MSG from '../msg';
import { AsyncMsgHandler } from './asyncmsghandler';
import { Phone } from "mainprocess/message/phone";
import { Message } from "mainprocess/message/msg";

export class RunCmdHandler extends AsyncMsgHandler {
  private _phone: Phone;
  private _cmdStr: string;

  public onParseArgs(msg: Message) {
    this._phone = msg.obj.phone as Phone;
    this._cmdStr = msg.obj.cmd as string;
    console.log(`main process run cmd handler, phone: ${this._phone}, cmd: ${this._cmdStr}`);
  }

  public onHandle() {
    exec(this._cmdStr, (error, stdout, stderr) => {
      if (error) {
        console.log('execute cmd:', this._cmdStr, 'error:', error);
        return;
      }
      let output: string = stdout as string;
      // send cmd result back
      this.sender.send(MSG.MSG_RUN_CMD_REPLY, output);
    });
  }
}