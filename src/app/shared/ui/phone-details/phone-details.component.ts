import { Component } from '@angular/core';
import { TabContentPage } from "app/shared/ui/tabview";
import { TabObj } from "app/shared/ui/tabview/tabobj";
import { Phone } from "app/shared/message";
import { Environment, Cmd } from "app/environment.service";

@Component({
  selector: 'app-phone-details',
  templateUrl: './phone-details.component.html',
  styleUrls: [ './phone-details.component.scss' ]
})
export class PhoneDetailsComponent extends TabContentPage {
  private _phone: Phone;

  constructor(
    private _environment: Environment
  ) {
    super();
  }

  get phone(): Phone {
    return this._phone;
  }

  public onAttachTabObj(tabObj: TabObj) {
    this._phone = tabObj.createArgs as Phone;
  }

  public showActivities() {
    let cmd = Cmd.obtain('show-phone-cmd-result', {
      phone: this._phone,
      cmd: `adb -s ${this._phone.serialno} shell dumpsys activity activities`,
    });
    this._environment.dispatchCmd(cmd);
  } 
}