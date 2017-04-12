import { Component, ChangeDetectorRef } from '@angular/core';

import { ipcRenderer } from 'electron';

import * as MSG from '../../message/index';
import { Phone } from "app/shared/message";
import { TabContentPage } from "app/shared/ui/tabview";
import { TabObj } from "app/shared/ui/tabview/tabobj";

@Component({
  selector: 'app-phone-cmd-view',
  templateUrl: './phone-cmd-result.component.html',
  styleUrls: [ './phone-cmd-result.component.scss' ]
})
export class PhoneCmdResultComponent extends TabContentPage {
  private _phone: Phone;
  private _cmdStr: string;
  private _cmdOutput: string;

  constructor(private _changeDetector: ChangeDetectorRef) {
    super();
  }

  public get cmdOutput(): string {
    return this._cmdOutput;
  }

  public onAttachTabObj(tabObj: TabObj) {
    this._phone = tabObj.createArgs.phone as Phone;
    this._cmdStr = tabObj.createArgs.cmd as string;
    console.log(`phone seariano: ${this._phone}, cmd; ${this._cmdStr}`);

    setTimeout(() => {
      let msg = new MSG.Message(MSG.MSG_RUN_CMD);
      msg.obj = {
        phone: this._phone,
        cmd: this._cmdStr,
      };
      ipcRenderer.send(MSG.ASYNC_MSG, msg)
    }, 0);
  }

  // private methods

  protected onInit() {
    ipcRenderer.on(MSG.MSG_RUN_CMD_REPLY, (event, arg) => {
      //console.log(`renderer process cmd: run cmd reply, result: ${arg}`);
      this._cmdOutput = arg as string;
      this._changeDetector.detectChanges();
    });
  }
}