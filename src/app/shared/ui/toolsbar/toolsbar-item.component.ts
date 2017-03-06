import { Component, Input } from '@angular/core';

import { ToolsBarConfigItem } from './toolsbar-config-item';
import { ToolsBarEventDispatcher } from './toolsbar-event-dispatcher';

@Component({
  selector: 'app-toolsbar-item',
  templateUrl: './toolsbar-item.component.html',
  styleUrls: [ './toolsbar-item.component.scss' ]
})
export class ToolsBarItemComponent {
  private _config: ToolsBarConfigItem;
  private _type: string = 'button';
  private _text: string = ''
  private _eventDispatcher: ToolsBarEventDispatcher;

  set configItem(config: ToolsBarConfigItem) {
    this._config = config;
    if (this._config) {
      this._type = this._config.type;
      this._text = this._config.text;
    }
  }

  get itemtype(): string {
    return this._type;
  }

  get itemtext(): string {
    return this._text;
  }

  set eventdispatcher(dispatcher: ToolsBarEventDispatcher) {
    this._eventDispatcher = dispatcher;
  }

  public onClick() {
    if (this._eventDispatcher) {
        this._eventDispatcher.dispatchClick(this._config ? this._config.cmd : null);
    }
  }

}