import { Injectable } from '@angular/core';

import { environment } from '../environments/environment';
import { ViewManager } from './view-manager';

export class Cmd {
  id: string;
  args: any;

  constructor(_id: string, _args?: any) {
    this.id = _id;
    if (_args) {
      this.args = _args;
    }
  }

  public static obtain(_id: string, _args?: any): Cmd {
    return new Cmd(_id, _args);
  }
}

export interface CmdHandlerFunc {
  (cmd: Cmd);
}

interface CmdHandlerMap {
  [key: string]: CmdHandlerFunc[];
}

@Injectable()
export class Environment {
  private _managers: ViewManager[] = [];
  private _handlers: CmdHandlerMap = {};

  constructor() {
  }

  get product(): boolean {
    return environment.production;
  }

  public registerManager(_manager: ViewManager) {
    if (!_manager) {
      return;
    }
    let manager = this._managers.find(item => {
      return item == _manager;
    });
    if (manager) {
      console.log('already exist manager:', _manager);
    } else {
      this._managers.push(_manager);
      _manager.init(this);
    }
  }

  public unregisterManager(_manager: ViewManager) {
    if (!_manager) {
      return;
    }
    let manager = this._managers.find(item => {
      return item == _manager;
    });
    let index = this._managers.findIndex(item => {
      return item == _manager;
    });
    if (index != -1) {
      this._managers.splice(index, 1);
      _manager.destroy(this);
    }
  }

  public registerHandler(cmd: string, handler: CmdHandlerFunc) {
    let handlers = this._handlers[cmd];
    if (!handlers) {
      handlers = [];
      this._handlers[cmd] = handlers;
    }
    handlers.push(handler);
  }

  public unregisterHandler(cmd: string, handler: CmdHandlerFunc) {
    let handlers = this._handlers[cmd];
    if (!handlers) {
      return;
    }
    let index = handlers.findIndex(item => {
      return item == handler;
    });
    if (index != -1) {
      handlers.splice(index, 1);
    }
  }

  public dispatchCmd(cmd: Cmd) {
    let handlers = this._handlers[cmd.id];
    if (handlers) {
      handlers.forEach((handle: CmdHandlerFunc) => {
        handle(cmd);
      });
    } else {
      console.log(`unknown cmd: ${cmd.id}`);
    }
  }
}
