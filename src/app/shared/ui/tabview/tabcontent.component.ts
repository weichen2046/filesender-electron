import { Component, Type, ViewContainerRef, ViewChild, ComponentFactoryResolver } from '@angular/core';

@Component({
  selector: 'tabcontent',
  templateUrl: './tabcontent.component.html'
})
export class TabContentComponent {
  @ViewChild('anchorTabContent', {read: ViewContainerRef})
  private _pageAnchor: ViewContainerRef;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver
  ) {
  }

  public addContentView(component: Type<any>) {
    let pageFactory = this._componentFactoryResolver.resolveComponentFactory(component);
    let pageRef = this._pageAnchor.createComponent(pageFactory);
    pageRef.changeDetectorRef.detectChanges();
  }
}
