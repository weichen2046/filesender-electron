import { ipcMain } from 'electron';
import { Message } from './msg';
import { Runtime } from '../runtime';
import { Phone } from '../message/phone';

class MsgResult {
  reply: string;
  arg: any;
  returnValue?: any;
}

export class MessageCenter {
  public init() {
    ipcMain.on('asynchronous-message', (event, arg) => {
      let msg = arg as Message;
      let res = this.handleAsyncMsg(msg);
      if (res.reply) {
        event.sender.send(res.reply, res.arg);
      }
    });
    ipcMain.on('synchronous-message', (event, arg) => {
      let msg = arg as Message;
      event.returnValue = this.handleSyncMsg(msg);
    })
  }

  public destroy() {
    ipcMain.removeAllListeners('asynchronous-message');
    ipcMain.removeAllListeners('synchronous-message');
  }

  private handleAsyncMsg(msg: Message): MsgResult {
    console.log('async msg from renderer process:', msg);
    let res = new MsgResult();
    if (msg.name == 'phone-list') {
      res.reply = 'phone-list-reply';
      res.arg = Runtime.instance.phones;
    }
    return res;
  }

  private handleSyncMsg(msg: Message) {
    console.log('sync msg from renderer process:', msg);
    return null;
  }
}