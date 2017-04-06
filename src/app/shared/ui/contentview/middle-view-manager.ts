import { Cmd, Environment } from '../../../environment.service';
import { ViewManager } from '../../../view-manager';

import { INVALID_TAB_ID } from '../tabview/index';
import { TabViewComponent } from '../tabview/index';
import { PhoneListComponent } from '../phone-list/index';

export class MiddleViewManager extends ViewManager {
  private _tabView: TabViewComponent;

  public init(environment: Environment) {
    environment.registerHandler('show-phone-list', this.showPhoneList.bind(this));
    environment.registerHandler('show-phone-detail', this.showPhoneDetails.bind(this));
  }

  public destroy(environment: Environment) {
    environment.registerHandler('show-phone-list', this.showPhoneList);
    environment.unregisterHandler('show-phone-detail', this.showPhoneDetails);
  }

  private showPhoneList(cmd: Cmd) {
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

  private showPhoneDetails(cmd: Cmd) {
    console.log('show phone details in middle view');
  }
}