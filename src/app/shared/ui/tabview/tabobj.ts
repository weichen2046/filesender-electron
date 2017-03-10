import { Type } from '@angular/core';

export class TabObj {
  id: number;
  name: string;
  title: string;
  pageComponent: Type<any>;
  isSingleton: boolean;

  private static _idGenerator: number = 0;

  public static makeTab(name: string, title: string, page: Type<any>, singleton = false): TabObj {
      let tab = new TabObj();
      tab.id = TabObj._idGenerator++;
      tab.name = name;
      tab.title = title;
      tab.pageComponent = page;
      tab.isSingleton = singleton;
      return tab;
  }
}