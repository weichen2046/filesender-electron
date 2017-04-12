import { Component } from '@angular/core';
import { TabObj } from "app/shared/ui/tabview/tabobj";

@Component({
  selector: 'app-tabbar-item',
  templateUrl: './tabbar-item.component.html',
  styleUrls: [ './tabbar-item.component.scss' ]
})
export class TabBarItemComponent {
  title: string = 'Demo Title';
  tabObj: TabObj;

  set active(state: boolean) {
    this.tabObj.focused = state;
    //console.log(`tab bar item title = "${this.title}", active = ${state}`);
  }
  get active(): boolean {
    return this.tabObj.focused;
  }

  public onClick() {
    this.tabObj.focus();
  }

  public close() {
    this.tabObj.close();
  }
}