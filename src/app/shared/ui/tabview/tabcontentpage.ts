import { TabObj } from "app/shared/ui/tabview/tabobj";

export class TabContentPage {
  tabObj: TabObj;

  set active(state: boolean) {
    if (state != this.tabObj.focused) {
      console.log(`Tab content page active state not match with tab bar`);
    }
  }
  get active(): boolean {
    return this.tabObj.focused;
  }
}