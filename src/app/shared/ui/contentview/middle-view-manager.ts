import { Cmd, Environment } from '../../../environment.service';
import { ViewManager } from '../../../view-manager';

import { INVALID_TAB_ID } from '../tabview/index';
import { TabViewComponent } from '../tabview/index';
import { PhoneListComponent } from '../phone-list/index';
import { Phone } from "app/shared/message";
import { PhoneDetailsComponent } from "app/shared/ui/phone-details";
import { PhoneCmdResultComponent } from "app/shared/ui/phone-cmd-result";

export class MiddleViewManager extends ViewManager {
  private _tabView: TabViewComponent;
  private _cmdHandlers = {};

  public init(environment: Environment) {
    this._cmdHandlers['show-phone-list'] = this.showPhoneList.bind(this);
    this._cmdHandlers['show-phone-detail'] = this.showPhoneDetails.bind(this);
    this._cmdHandlers['show-phone-cmd-result'] = this.showPhoneCmdResult.bind(this);

    for (let cmd in this._cmdHandlers) {
      if (this._cmdHandlers.hasOwnProperty(cmd)) {
        environment.registerHandler(cmd, this._cmdHandlers[cmd]);
      }
    }
  }

  public destroy(environment: Environment) {
    for (let cmd in this._cmdHandlers) {
      if (this._cmdHandlers.hasOwnProperty(cmd)) {
        environment.unregisterHandler(cmd, this._cmdHandlers[cmd]);
      }
    }
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
    //console.log('open phone list component in a tab');
    this.makeSureTabViewContainer();
    let tabName = `phone-list`;
    let tabTitle = `Phone List`;
    let tabId = this._tabView.manager.createTab(tabName, tabTitle, PhoneListComponent, true);
    this._tabView.manager.focusTab(tabId);
  }

  private showPhoneDetails(cmd: Cmd) {
    let phone = cmd.args as Phone;
    //console.log('show phone details in middle view, phone:', phone);
    this.makeSureTabViewContainer();
    let tabName = `phone-detail-${phone.serialno}`;
    let tabTitle = `Phone Details - ${phone.serialno}`;
    let tabId = this._tabView.manager.createTab(tabName, tabTitle, PhoneDetailsComponent, true, phone);
    this._tabView.manager.focusTab(tabId);
  }

  private showPhoneCmdResult(cmd: Cmd) {
    this.makeSureTabViewContainer();
    let tabName = `phone-cmd-result`;
    let tabTitle = `Phone Cmd Result`;
    let tabId = this._tabView.manager.createTab(tabName, tabTitle, PhoneCmdResultComponent, false, cmd.args);
    this._tabView.manager.focusTab(tabId);
  }
}