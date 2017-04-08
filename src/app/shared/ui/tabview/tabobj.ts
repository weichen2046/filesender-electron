import { Type } from '@angular/core';
import { TabViewManager } from "app/shared/ui/tabview";

export class TabObj {
  id: number;
  name: string;
  title: string;
  pageComponent: Type<any>;
  isSingleton: boolean;
  manager: TabViewManager;
  focused: boolean = false;

  private static _idGenerator: number = 0;

  public static makeTab(manager: TabViewManager, name: string, title: string,
    page: Type<any>, singleton = false): TabObj {
    let tab = new TabObj();
    tab.manager = manager;
    tab.id = TabObj._idGenerator++;
    tab.name = name;
    tab.title = title;
    tab.pageComponent = page;
    tab.isSingleton = singleton;
    return tab;
  }

  public focus() {
    if (this.focused) {
      return;
    }
    this.manager.focusTab(this.id);
  }
}