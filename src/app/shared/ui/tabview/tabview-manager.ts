import { Type, ComponentFactoryResolver } from '@angular/core';

import { TabBarComponent } from './tabbar.component';
import { TabContentComponent } from './tabcontent.component';
import { TabObj } from './tabobj';

export const INVALID_TAB_ID: number = -1;

export class TabViewManager {
  private _bar: TabBarComponent;
  private _content: TabContentComponent;
  private _factoryResolver: ComponentFactoryResolver;

  private _tabs: TabObj[] = [];

  public attach(bar: TabBarComponent, content: TabContentComponent, resolver: ComponentFactoryResolver) {
    this._bar = bar;
    this._content = content;
    this._factoryResolver = resolver;
  }

  public createTab(name: string, title: string, component: Type<any>, singleton = false) {
    // add new tab to the tabview, this will create a new item in tabbar, and
    // init a `component` page show in the tabcontent.
    //console.log('tabview manager, _bar:', this._bar, '_content:', this._content);
    if (singleton) {
      let tabId = this.findTab(name);
      if (tabId != INVALID_TAB_ID) {
        return tabId;
      }
    }
    let tabObj = TabObj.makeTab(this, name, title, component, singleton);
    this._bar.addItem(title, tabObj);
    this._content.addContentView(component, tabObj);
    this._tabs.push(tabObj);
    return tabObj.id;
  }

  public focusTab(tabId: number) {
    // highlight focused tabbar item
    this._bar.focusTab(tabId);
    // hide none focused tabcontent
    this._content.focusTab(tabId)
  }

  public findTab(name: string): number {
    if (!name) {
      return INVALID_TAB_ID;
    }
    let tabObj = this._tabs.find(tab => tab.name == name);
    if (tabObj) {
      return tabObj.id;
    }
    return INVALID_TAB_ID;
  }
}