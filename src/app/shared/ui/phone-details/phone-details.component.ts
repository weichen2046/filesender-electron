import { Component } from '@angular/core';
import { TabContentPage } from "app/shared/ui/tabview";
import { TabObj } from "app/shared/ui/tabview/tabobj";
import { Phone } from "app/shared/message";

@Component({
  selector: 'app-phone-details',
  templateUrl: './phone-details.component.html',
  styleUrls: [ './phone-details.component.scss' ]
})
export class PhoneDetailsComponent extends TabContentPage {
  private _phone: Phone;

  public onAttachTabObj(tabObj: TabObj) {
    this._phone = tabObj.createArgs as Phone;
  }

  get phone(): Phone {
    return this._phone;
  }
}