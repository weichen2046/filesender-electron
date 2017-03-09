import { Component, ViewContainerRef, ViewChild, AfterViewInit, ComponentFactoryResolver } from '@angular/core';

import { TabBarItemComponent } from './tabbar-item.component';

@Component({
  selector: 'tabbar',
  templateUrl: './tabbar.component.html',
  entryComponents: [ TabBarItemComponent ]
})
export class TabBarComponent implements AfterViewInit {
  @ViewChild('anchorTabBar', {read: ViewContainerRef})
  private _itemAnchor: ViewContainerRef;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver
  ) {
  }

  ngAfterViewInit() {
  }

  public addItem(title: string) {
    let itemFactory = this._componentFactoryResolver.resolveComponentFactory(TabBarItemComponent);
    let itemRef = this._itemAnchor.createComponent(itemFactory);
    itemRef.instance.title = title;
    itemRef.changeDetectorRef.detectChanges();
  }
}
