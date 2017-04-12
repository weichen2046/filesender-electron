import { TabObj } from "app/shared/ui/tabview/tabobj";

export abstract class TabContentPage {
  private _tabObj: TabObj;

  constructor() {
    this.init();
  }

  set active(state: boolean) {
    if (state != this.tabObj.focused) {
      console.log(`Tab content page active state not match with tab bar`);
    }
  }
  get active(): boolean {
    return this.tabObj.focused;
  }

  set tabObj(_tabObj: TabObj) {
    this._tabObj = _tabObj;
    this.onAttachTabObj(_tabObj);
  }
  get tabObj(): TabObj {
    return this._tabObj;
  }

  public onAttachTabObj(tabObj: TabObj) {
  }

  // protected methods

  protected onInit() {
  }

  // private methods

  private init() {
    this.onInit();
  }
}