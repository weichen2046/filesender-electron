import { ipcMain } from 'electron';

import * as MSG from './msg';
import { Phone } from '../message/phone';
import { Runtime } from '../runtime';
import { ShareFileHandler } from './handler/sharefilehandler';
import { AsyncMsgHandler } from './handler/asyncmsghandler';
import { LocalPhoneListHandler } from './handler/localphonelist';

export class MessageCenter {
  public init() {
    ipcMain.on(MSG.ASYNC_MSG, (event, arg) => {
      let msg = arg as MSG.Message;
      let res = this.handleAsyncMsg(msg, event.sender);
    });
    ipcMain.on(MSG.SYNC_MSG, (event, arg) => {
      let msg = arg as MSG.Message;
      event.returnValue = this.handleSyncMsg(msg);
    })
  }

  public destroy() {
    ipcMain.removeAllListeners(MSG.ASYNC_MSG);
    ipcMain.removeAllListeners(MSG.SYNC_MSG);
  }

  private handleAsyncMsg(msg: MSG.Message, sender: Electron.WebContents) {
    console.log('async msg from renderer process:', msg);
    let handler: AsyncMsgHandler = null;
    switch (msg.name) {
      case MSG.MSG_PHONE_LIST:
        sender.send(MSG.MSG_PHONE_LIST_REPLY, Runtime.instance.phones);
        break;
      case MSG.MSG_SHARE_FILES:
        handler = new ShareFileHandler(sender);
        break;
      case MSG.MSG_LOCAL_PHONE_LIST:
        handler = new LocalPhoneListHandler(sender);
        break;
    }
    if (handler) {
      handler.handle(msg);
    }
  }

  private handleSyncMsg(msg: MSG.Message) {
    console.log('sync msg from renderer process:', msg);
    return null;
  }
}