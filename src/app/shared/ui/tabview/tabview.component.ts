import { OnInit, Component, ViewChild, AfterViewInit, ComponentFactoryResolver } from '@angular/core';

import { TabViewManager } from './tabview-manager';
import { TabBarComponent } from './tabbar.component';
import { TabContentComponent } from './tabcontent.component';

@Component({
  selector: 'tabview',
  templateUrl: './tabview.component.html'
})
export class TabViewComponent implements OnInit, AfterViewInit {
  private _manager: TabViewManager;

  @ViewChild(TabBarComponent)
  private _bar: TabBarComponent;
  @ViewChild(TabContentComponent)
  private _content: TabContentComponent;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver
  ) {
    this._manager = new TabViewManager();
  }

  ngOnInit() {
    //console.log('TabViewComponent ngOnInit');
  }

  ngAfterViewInit() {
    //console.log('TabViewComponent, _bar:', this._bar, '_content:', this._content);
    this._manager.attach(this._bar, this._content, this._componentFactoryResolver);
  }

  get manager(): TabViewManager {
    return this._manager;
  }
}
