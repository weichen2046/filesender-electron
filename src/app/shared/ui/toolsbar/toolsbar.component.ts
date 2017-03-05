import { Component, ViewChild, AfterViewInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

import { ToolsBarItemComponent } from './toolsbar-item.component';

const fs = require('fs');
const { remote } = require('electron');

@Component({
  selector: 'toolsbar',
  templateUrl: './toolsbar.component.html',
  styleUrls: [ './toolsbar.component.scss' ],

  entryComponents: [ ToolsBarItemComponent ]
})
export class ToolsBarComponent implements AfterViewInit, OnChanges {

  configfile: string;

  @ViewChild('anchor', {read: ViewContainerRef})
  private _itemAnchor: ViewContainerRef;

  private _configJson: any;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(ToolsBarItemComponent);
    let configFile = remote.app.getAppPath() + '/dist/config/toolsbar.config.json';
    this.loadItems(configFile);
  }

  ngOnChanges(changes) {
  }

  public loadItems(config?: string) {
    //console.log('load toolsbar items from file:', config);
    fs.readFile(config, 'utf8', (err, data) => {
      if (err) {
        console.log('toolsbar config load err:', err);
        return;
      }
      this._configJson = JSON.parse(data);
      let componentFactory = this._componentFactoryResolver.resolveComponentFactory(ToolsBarItemComponent);
      this._configJson.items.forEach((item) => {
        //console.log('config item:', item);
        let componentRef = this._itemAnchor.createComponent(componentFactory);
        componentRef.instance.itemtype = item.type;
        componentRef.instance.itemtext = item.text;
        componentRef.instance.clickhandler = this[item.cmd];
      });
      this._changeDetectorRef.detectChanges();
    });
  }

  public showPCs() {
    console.log('showPCs');
  }
}
