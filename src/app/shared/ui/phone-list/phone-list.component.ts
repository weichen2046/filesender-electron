import { Component } from '@angular/core';
import { ipcRenderer } from 'electron';

import { Message } from '../../message/index';
import { Phone } from '../../message/index';

@Component({
  selector: 'app-phone-list',
  templateUrl: './phone-list.component.html',
  styleUrls: [ './phone-list.component.scss' ]
})
export class PhoneListComponent {
  constructor() {
    this.init();
    this.retrievePhoneList();
  }

  private init() {
    ipcRenderer.on('phone-list-reply', (event, arg) => {
      console.log('async msg from main process', arg)
      let phones = arg as Phone[];
      this.onPhoneListRetrieved(phones);
    })
  }

  private retrievePhoneList() {
    let msg = new Message();
    msg.name = 'phone-list';
    ipcRenderer.send('asynchronous-message', msg)
  }

  private onPhoneListRetrieved(phones: Phone[]) {
    phones.forEach(item => {
      // TODO:
    });
  }
}