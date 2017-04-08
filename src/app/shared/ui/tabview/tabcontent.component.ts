import { Component, Type, ViewContainerRef, ViewChild, ComponentFactoryResolver, ChangeDetectorRef } from '@angular/core';
import { TabContentPage } from "app/shared/ui/tabview";
import { TabObj } from "app/shared/ui/tabview/tabobj";

@Component({
  selector: 'tabcontent',
  templateUrl: './tabcontent.component.html'
})
export class TabContentComponent {
  @ViewChild('anchorTabContent', {read: ViewContainerRef})
  private _pageAnchor: ViewContainerRef;

  private _items: TabContentPage[] = [];

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _changeDetector: ChangeDetectorRef,
  ) {
  }

  public addContentView(component: Type<any>, tabObj: TabObj) {
    let pageFactory = this._componentFactoryResolver.resolveComponentFactory(component);
    let pageRef = this._pageAnchor.createComponent(pageFactory);
    let contentpage = pageRef.instance as TabContentPage;
    contentpage.tabObj = tabObj;
    this._items.push(contentpage);
    pageRef.changeDetectorRef.detectChanges();
  }

  public focusTab(tabId: number) {
    this._items.forEach(item => {
      item.active = (item.tabObj.id == tabId) ? true: false;
    });
    this._changeDetector.detectChanges();
  }
}
