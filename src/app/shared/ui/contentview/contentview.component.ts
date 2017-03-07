import { Component, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';

import { ToolsBarManager } from '../toolsbar/toolsbar-manager';
import { ToolsBarCmdHandler } from '../toolsbar/toolsbar-cmd-handler';
import { ContentViewManager } from './contentview-manager';

@Component({
  selector: 'contentview',
  templateUrl: './contentview.component.html',
  styleUrls: [ './contentview.component.scss' ]
})
export class ContentViewComponent implements ToolsBarCmdHandler, AfterViewInit {
  @ViewChild('anchorLeft', {read: ViewContainerRef}) _childAnchorLeft: ViewContainerRef;
  @ViewChild('anchorMiddle', {read: ViewContainerRef}) _childAnchorMidd: ViewContainerRef;
  @ViewChild('anchorRight', {read: ViewContainerRef}) _childAnchorRight: ViewContainerRef;

  private _showLeft: boolean = false;
  private _showRight: boolean = false;
  private _showMiddle: boolean = true;

  private _manager: ContentViewManager;
  private _viewInitialized: boolean = false;

  constructor() {
    this._manager = new ContentViewManager();
  }

  ngAfterViewInit() {
    this._viewInitialized = true;
  }

  public showLeft(show: boolean) {
    this._showLeft = show;
  }

  get isleftshow(): boolean {
    return this._showLeft;
  }

  get isrightshow(): boolean {
    return this._showRight;
  }

  get ismiddleshow(): boolean {
    return this._showMiddle;
  }

  public bindToolsBarManager(manager: ToolsBarManager) {
    manager.registerHandler('toolsbar-cmd-showPCs', this);
  }

  public handleCmd(cmd: string) {
    console.log('content view handle cmd:', cmd);
  }

}
