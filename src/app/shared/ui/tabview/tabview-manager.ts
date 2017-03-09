import { Type, ComponentFactoryResolver } from '@angular/core';

import { TabBarComponent } from './tabbar.component';
import { TabContentComponent } from './tabcontent.component';

export const INVALID_TAB_ID: number = -1;

export class TabViewManager {
  private _bar: TabBarComponent;
  private _content: TabContentComponent;
  private _factoryResolver: ComponentFactoryResolver;

  public attach(bar: TabBarComponent, content: TabContentComponent, resolver: ComponentFactoryResolver) {
    this._bar = bar;
    this._content = content;
    this._factoryResolver = resolver;
  }

  public createTab(tabName: string, title: string, component: Type<any>) {
    // add new tab to the tabview, this will create a new item in tabbar, and
    // init a `component` page show in the tabcontent.
    //console.log('tabview manager, _bar:', this._bar, '_content:', this._content);
    this._bar.addItem(title);
    this._content.addContentView(component);
    return INVALID_TAB_ID;
  }

  public focusTab(tabId: number) {
  }

  public findTab(tabName: string): number {
    return INVALID_TAB_ID;
  }

}