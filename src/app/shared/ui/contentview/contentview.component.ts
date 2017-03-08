import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

import { ToolsBarManager } from '../toolsbar/toolsbar-manager';
import { ContentViewManager } from './contentview-manager';
import { LeftViewManager, RightViewManager } from './contentview-manager';
import { MiddleViewManager } from './middle-view-manager';

import { TabViewComponent } from '../tabview/tabview.component';

@Component({
  selector: 'contentview',
  templateUrl: './contentview.component.html',
  styleUrls: [ './contentview.component.scss' ],
  entryComponents: [ TabViewComponent ]
})
export class ContentViewComponent implements AfterViewInit {
  @ViewChild('anchorLeft', {read: ViewContainerRef}) _childAnchorLeft: ViewContainerRef;
  @ViewChild('anchorMiddle', {read: ViewContainerRef}) _childAnchorMidd: ViewContainerRef;
  @ViewChild('anchorRight', {read: ViewContainerRef}) _childAnchorRight: ViewContainerRef;

  private _showLeft: boolean = false;
  private _showRight: boolean = false;
  private _showMiddle: boolean = true;

  private _viewInitialized: boolean = false;
  private _manager: ContentViewManager;
  private _leftManager: LeftViewManager;
  private _middleManager: MiddleViewManager;
  private _rightManager: RightViewManager;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver
  ) {
    this._manager = new ContentViewManager();
    this._leftManager = new LeftViewManager();
    this._middleManager = new MiddleViewManager();
    this._rightManager = new RightViewManager();
  }

  ngAfterViewInit() {
    this._viewInitialized = true;
    this._leftManager.attach(this._childAnchorLeft, this._componentFactoryResolver);
    this._middleManager.attach(this._childAnchorMidd, this._componentFactoryResolver);
    this._rightManager.attach(this._childAnchorRight, this._componentFactoryResolver);
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
    manager.registerHandler('toolsbar-cmd-showPCs', this._middleManager);
  }
}
