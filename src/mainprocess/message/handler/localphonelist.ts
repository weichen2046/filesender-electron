const exec = require('child_process').exec

import { Phone } from '../phone';
import * as MSG from '../msg';
import { AsyncMsgHandler } from './asyncmsghandler';

export class LocalPhoneListHandler extends AsyncMsgHandler {
  constructor(sender: Electron.WebContents) {
    super(sender);
  }

  public onHandle() {
    let cmd = 'adb devices';
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log('execute cmd:', cmd, 'error:', error);
        return;
      }
      let output: string = stdout as string;
      let lines: string[] = output.split('\n');
      // ignore the first line
      if (lines.length > 1) {
        lines.splice(0, 1);
      }
      let phones: Phone[] = [];
      lines.forEach((line: string) => {
        if (line.length != 0) {
          let fields = line.split('\t');
          let phone = new Phone();
          phone.islocal = true;
          phone.serialno = fields[0];
          phone.state = fields[1];
          phones.push(phone);
        }
      });

      // send phone back
      this.sender.send(MSG.MSG_LOCAL_PHONE_LIST_REPLY, phones);
    })
  }
}