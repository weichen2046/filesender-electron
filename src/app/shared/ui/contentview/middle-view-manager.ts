import { Cmd, Environment } from '../../../environment.service';
import { ViewManager } from '../../../view-manager';

import { INVALID_TAB_ID } from '../tabview/index';
import { TabViewComponent } from '../tabview/index';
import { PhoneListComponent } from '../phone-list/index';
import { Phone } from "app/shared/message";
import { PhoneDetailsComponent } from "app/shared/ui/phone-details";

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

  // private methods

  private makeSureTabViewContainer() {
    if (!this._tabView) {
      let componentFactory = this._compFactoryResolver.resolveComponentFactory(TabViewComponent);
      let tabviewRef = this._viewAnchor.createComponent(componentFactory);
      tabviewRef.changeDetectorRef.detectChanges();
      this._tabView = tabviewRef.instance;
    }
  }

  private showPhoneList(cmd: Cmd) {
    console.log('open phone list component in a tab');
    this.makeSureTabViewContainer();
    let tabName = `phone-list`;
    let tabTitle = `Phone List`;
    let tabId = this._tabView.manager.findTab(tabName);
    if (tabId == INVALID_TAB_ID) {
      tabId = this._tabView.manager.createTab(tabName, tabTitle, PhoneListComponent);
    }
    this._tabView.manager.focusTab(tabId);
  }

  private showPhoneDetails(cmd: Cmd) {
    let phone = cmd.args as Phone;
    //console.log('show phone details in middle view, phone:', phone);
    this.makeSureTabViewContainer();
    let tabName = `phone-detail-${phone.serialno}`;
    let tabTitle = `Phone Details - ${phone.serialno}`;
    let tabId = this._tabView.manager.findTab(tabName);
    if (tabId == INVALID_TAB_ID) {
      tabId = this._tabView.manager.createTab(tabName, tabTitle, PhoneDetailsComponent);
    }
    this._tabView.manager.focusTab(tabId);
  }
}