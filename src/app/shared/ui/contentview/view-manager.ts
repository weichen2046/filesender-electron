import { ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

import { ToolsBarCmdHandler } from '../toolsbar/toolsbar-cmd-handler';

export abstract class ViewManager implements ToolsBarCmdHandler {
  protected _viewAnchor: ViewContainerRef;
  protected _compFactoryResolver: ComponentFactoryResolver;

  public attach(viewAnchorRef: ViewContainerRef, compFactoryResolver: ComponentFactoryResolver) {
    this._viewAnchor = viewAnchorRef;
    this._compFactoryResolver = compFactoryResolver;
  }

  public handleCmd(cmd: string) {
  }
}
