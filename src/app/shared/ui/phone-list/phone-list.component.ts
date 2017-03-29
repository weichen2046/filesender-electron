import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { ipcRenderer } from 'electron';

import { ASYNC_MSG, Message } from '../../message/index';
import { Phone } from '../../message/index';

@Component({
  selector: 'app-phone-list',
  templateUrl: './phone-list.component.html',
  styleUrls: [ './phone-list.component.scss' ]
})
export class PhoneListComponent {
  private _phones: Phone[] = [];

  constructor(private _changeDetector: ChangeDetectorRef) {
    this.init();
    this.retrievePhoneList();
  }

  get phones(): Phone[] {
    return this._phones;
  }

  public shareFiles(phone: Phone) {
    let msg = new Message('share-files');
    msg.obj = phone;
    ipcRenderer.send(ASYNC_MSG, msg)
  }

  private init() {
    ipcRenderer.on('phone-list-reply', (event, arg) => {
      console.log('async msg from main process', arg)
      let phones = arg as Phone[];
      this.onPhoneListRetrieved(phones);
    })
  }

  private retrievePhoneList() {
    let msg = new Message('phone-list');
    ipcRenderer.send(ASYNC_MSG, msg)
  }

  private onPhoneListRetrieved(_phones: Phone[]) {
    /*
    // TODO: we can filter or transform the phone item here
    phones.forEach(item => {
      console.log('received phone:', item);
    });
    */
    this._phones = _phones;
    this._changeDetector.detectChanges();
  }
}