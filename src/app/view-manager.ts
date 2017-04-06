import { ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

import { Environment } from './environment.service';

export abstract class ViewManager {
  protected _viewAnchor: ViewContainerRef;
  protected _compFactoryResolver: ComponentFactoryResolver;

  public attach(viewAnchorRef: ViewContainerRef, compFactoryResolver: ComponentFactoryResolver) {
    this._viewAnchor = viewAnchorRef;
    this._compFactoryResolver = compFactoryResolver;
  }

  public init(environment: Environment) {
  }

  public destroy(environment: Environment) {
  }
}
