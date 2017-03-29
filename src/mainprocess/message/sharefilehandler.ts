import { dialog } from 'electron';

import { Phone } from './phone';

export class ShareFileHandler {
  constructor(private _phone: Phone) {
  }

  public handle() {
    dialog.showOpenDialog({
      title: 'Select File To Share',
      properties: ['openFile', 'multiSelections']
    }, (paths) => {
      //console.log('selected paths:', paths, 'phone:', this._phone);
      // TODO: connect phone and share file
    });
  }
}