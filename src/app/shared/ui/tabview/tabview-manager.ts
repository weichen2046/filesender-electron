import { Type } from '@angular/core';

export const INVALID_TAB_ID: number = -1;

export class TabViewManager {
  public createTab(tabName: string, title: string, component: Type<any>) {
    // TODO: add new tab to the tabview, this will create a new item in
    // tabsbar, and use `component` show in the tabcontent.
    return INVALID_TAB_ID;
  }

  public focusTab(tabId: number) {
  }

  public findTab(tabName: string): number {
    return INVALID_TAB_ID;
  }

}