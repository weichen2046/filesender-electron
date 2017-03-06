import { ToolsBarCmdHandler } from './toolsbar-cmd-handler';
import { ToolsBarEventDispatcher } from './toolsbar-event-dispatcher';

interface CmdMap {
  [key: string]: ToolsBarCmdHandler[];
}

export class ToolsBarManager implements ToolsBarEventDispatcher {
  private _cmdMap: CmdMap = {};

  public registerHandler(cmd: string, handler: ToolsBarCmdHandler) {
    if (!this._cmdMap[cmd]) {
      this._cmdMap[cmd] = [];
    }
    this._cmdMap[cmd].push(handler);
  }

  public dispatchClick(cmd: string) {
    console.log('dispatch click event, cmd:', cmd);
    if (this._cmdMap[cmd]) {
        let handlers = this._cmdMap[cmd];
        handlers.forEach((handler) => {
          handler.handleCmd(cmd);
        });
    }
  }

}