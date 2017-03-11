import { ViewManager } from './view-manager';

import { TabViewComponent } from '../tabview/index';
import { INVALID_TAB_ID } from '../tabview/index';
import { PhoneListComponent } from '../phone-list/index';

import { ToolsBarHandlerItem } from '../toolsbar/toolsbar-handler-item';

const CMD_SHOW_PHONES: string = 'toolsbar-cmd-showPhones';

export class MiddleViewManager extends ViewManager {
  private _tabView: TabViewComponent;

  public getToolsBarCmdHandlers(): ToolsBarHandlerItem[] {
    let handlers: ToolsBarHandlerItem[] = [];
    handlers.push({cmd: CMD_SHOW_PHONES, handler: this})
    return handlers;
  }

  public handleCmd(cmd: string) {
    switch(cmd) {
      case CMD_SHOW_PHONES:
        this.showPhones();
        break;
      default:
        console.log('MiddleViewManager unknown toolsbar cmd:', cmd);
        break;
    }
  }

  private showPhones() {
    console.log('open phone list component in a tab');
    if (!this._tabView) {
      let componentFactory = this._compFactoryResolver.resolveComponentFactory(TabViewComponent);
      let tabviewRef = this._viewAnchor.createComponent(componentFactory);
      tabviewRef.changeDetectorRef.detectChanges();
      this._tabView = tabviewRef.instance;
    }
    let tabId = this._tabView.manager.findTab('phone-list');
    if (tabId == INVALID_TAB_ID) {
      tabId = this._tabView.manager.createTab('phone-list', 'Phone List', PhoneListComponent);
    }
    this._tabView.manager.focusTab(tabId);
  }
}