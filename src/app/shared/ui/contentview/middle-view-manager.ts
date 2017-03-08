import { ViewManager } from './view-manager';

import { TabViewComponent } from '../tabview/index';
import { INVALID_TAB_ID } from '../tabview/index';
import { PCListComponent } from '../pc-list/index';

export class MiddleViewManager extends ViewManager {
  private _tabView: TabViewComponent;

  public handleCmd(cmd: string) {
    switch(cmd) {
      case 'toolsbar-cmd-showPCs':
        this.showPCs();
        break;
      default:
        console.log('MiddleViewManager unknown toolsbar cmd:', cmd);
        break;
    }
  }

  private showPCs() {
    console.log('open pc list component in a tab');
    if (!this._tabView) {
      let componentFactory = this._compFactoryResolver.resolveComponentFactory(TabViewComponent);
      let tabviewRef = this._viewAnchor.createComponent(componentFactory);
      this._tabView = tabviewRef.instance;
    }
    let tabId = this._tabView.manager.findTab('pc-list');
    if (tabId == INVALID_TAB_ID) {
      tabId = this._tabView.manager.createTab('pc-list', 'PC List', PCListComponent);
    }
    this._tabView.manager.focusTab(tabId);
  }
}