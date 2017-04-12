import { Component, ViewContainerRef, ViewChild, AfterViewInit, ComponentFactoryResolver, ChangeDetectorRef } from '@angular/core';

import { TabBarItemComponent } from './tabbar-item.component';
import { TabObj } from "app/shared/ui/tabview/tabobj";

@Component({
  selector: 'tabbar',
  templateUrl: './tabbar.component.html',
  entryComponents: [ TabBarItemComponent ]
})
export class TabBarComponent implements AfterViewInit {
  @ViewChild('anchorTabBar', {read: ViewContainerRef})
  private _itemAnchor: ViewContainerRef;

  private _items: TabBarItemComponent[] = [];

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _changeDetector: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit() {
  }

  public addItem(title: string, tabObj: TabObj) {
    let itemFactory = this._componentFactoryResolver.resolveComponentFactory(TabBarItemComponent);
    let itemRef = this._itemAnchor.createComponent(itemFactory);
    this._items.push(itemRef.instance);
    itemRef.instance.title = title;
    itemRef.instance.tabObj = tabObj;
    itemRef.changeDetectorRef.detectChanges();
  }

  public focusTab(tabId: number) {
    this._items.forEach(item => {
      item.active = (item.tabObj.id == tabId) ? true: false;
    });
    this._changeDetector.detectChanges();
  }

  public closeTab(tabId: number) {
    // TODO: remove tabbar-item component
  }
}
