import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { ipcRenderer } from 'electron';

import { Cmd, Environment } from '../../../environment.service';

import * as MSG from '../../message/index';
import { Phone } from '../../message/index';

@Component({
  selector: 'app-phone-list',
  templateUrl: './phone-list.component.html',
  styleUrls: [ './phone-list.component.scss' ]
})
export class PhoneListComponent {
  private _phones: Phone[] = [];

  constructor(
    private _environment: Environment,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.init();
    this.retrievePhoneList();
    this.retrieveLocalPhoneList();
  }

  get phones(): Phone[] {
    return this._phones;
  }

  public shareFiles(phone: Phone) {
    let msg = new MSG.Message(MSG.MSG_SHARE_FILES);
    msg.obj = phone;
    ipcRenderer.send(MSG.ASYNC_MSG, msg)
  }

  public showPhoneDetails(phone: Phone) {
    let cmd = Cmd.obtain('show-phone-detail', phone);
    this._environment.dispatchCmd(cmd);
  }

  // private methods

  private init() {
    ipcRenderer.on(MSG.MSG_PHONE_LIST_REPLY, (event, arg) => {
      let phones = arg as Phone[];
      this.onPhoneListRetrieved(phones);
    });
    ipcRenderer.on(MSG.MSG_LOCAL_PHONE_LIST_REPLY, (event, arg) => {
      let phones = arg as Phone[];
      this.onLocalPhoneListRetrieved(phones);
    });
  }

  private retrievePhoneList() {
    let msg = new MSG.Message(MSG.MSG_PHONE_LIST);
    ipcRenderer.send(MSG.ASYNC_MSG, msg)
  }

  private onPhoneListRetrieved(_phones: Phone[]) {
    _phones.forEach(item => {
      this._phones.push(item);
    });
    this._changeDetector.detectChanges();
  }

  private retrieveLocalPhoneList() {
    let msg = new MSG.Message(MSG.MSG_LOCAL_PHONE_LIST);
    ipcRenderer.send(MSG.ASYNC_MSG, msg);
  }

  private onLocalPhoneListRetrieved(_phones: Phone[]) {
    _phones.forEach(item => {
      this._phones.push(item);
    });
    this._changeDetector.detectChanges();
  }
}