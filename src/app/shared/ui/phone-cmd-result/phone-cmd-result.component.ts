import { Component } from '@angular/core';
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

  public onAttachTabObj(tabObj: TabObj) {
    // TODO: parse tabObj.createArgs
  }
}