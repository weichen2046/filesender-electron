import { dialog } from 'electron';

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
    });
  }
}