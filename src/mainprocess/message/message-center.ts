import { ipcMain } from 'electron';

import { ASYNC_MSG, Message, SYNC_MSG } from './msg';
import { Phone } from '../message/phone';
import { Runtime } from '../runtime';
import { ShareFileHandler } from './sharefilehandler';

class MsgResult {
  reply: string;
  arg: any;
  returnValue?: any;
}

export class MessageCenter {
  public init() {
    ipcMain.on(ASYNC_MSG, (event, arg) => {
      let msg = arg as Message;
      let res = this.handleAsyncMsg(msg);
      if (res.reply) {
        event.sender.send(res.reply, res.arg);
      }
    });
    ipcMain.on(SYNC_MSG, (event, arg) => {
      let msg = arg as Message;
      event.returnValue = this.handleSyncMsg(msg);
    })
  }

  public destroy() {
    ipcMain.removeAllListeners(ASYNC_MSG);
    ipcMain.removeAllListeners(SYNC_MSG);
  }

  private handleAsyncMsg(msg: Message): MsgResult {
    console.log('async msg from renderer process:', msg);
    let res = new MsgResult();
    if (msg.name == 'phone-list') {
      res.reply = 'phone-list-reply';
      res.arg = Runtime.instance.phones;
    } else if (msg.name == 'share-files') {
      let phone: Phone = msg.obj as Phone;
      let handler = new ShareFileHandler(phone);
      handler.handle();
    }
    return res;
  }

  private handleSyncMsg(msg: Message) {
    console.log('sync msg from renderer process:', msg);
    return null;
  }
}