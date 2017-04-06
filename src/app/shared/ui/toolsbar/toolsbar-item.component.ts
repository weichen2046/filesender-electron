import { Component, Input, OnInit, AfterViewInit } from '@angular/core';

import { Cmd, Environment } from '../../../environment.service';
import { ToolsBarConfigItem } from './toolsbar-config-item';

@Component({
  selector: 'app-toolsbar-item',
  templateUrl: './toolsbar-item.component.html',
  styleUrls: [ './toolsbar-item.component.scss' ]
})
export class ToolsBarItemComponent implements OnInit, AfterViewInit {
  private _config: ToolsBarConfigItem;
  private _type: string = 'button';
  private _text: string = ''

  constructor(private environment: Environment) {
  }

  ngOnInit() {
    //console.log('ToolsBarItemComponent ngOnInit');
  }

  ngAfterViewInit() {
    //console.log('ToolsBarItemComponent ngAfterViewInit');
  }

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

  public onClick() {
    if (!this._config) {
      console.log('toolsbar item config not set');
      return;
    }

    let cmd = Cmd.obtain(this._config.cmd)
    this.environment.dispatchCmd(cmd);
  }
}
