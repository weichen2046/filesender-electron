import { Message } from '../msg';

export abstract class AsyncMsgHandler {
  constructor(protected sender: Electron.WebContents) {
  }

  public handle(msg: Message) {
    this.onParseArgs(msg);
    this.onHandle();
  }

  public onParseArgs(msg: Message) {
  }

  public abstract onHandle();
}