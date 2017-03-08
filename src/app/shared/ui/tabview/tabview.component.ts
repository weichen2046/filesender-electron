import { Component } from '@angular/core';

import { TabViewManager } from './tabview-manager';

@Component({
  selector: 'tabview',
  templateUrl: './tabview.component.html'
})
export class TabViewComponent {
  private _manager: TabViewManager;

  constructor() {
    this._manager = new TabViewManager();
  }

  get manager(): TabViewManager {
    return this._manager;
  }
}
