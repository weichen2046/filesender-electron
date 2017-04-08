import { Component } from '@angular/core';
import { TabContentPage } from "app/shared/ui/tabview";
import { TabObj } from "app/shared/ui/tabview/tabobj";

@Component({
  selector: 'app-phone-details',
  templateUrl: './phone-details.component.html',
  styleUrls: [ './phone-details.component.scss' ]
})
export class PhoneDetailsComponent extends TabContentPage {
}