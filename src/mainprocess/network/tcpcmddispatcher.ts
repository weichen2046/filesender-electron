import { config } from './config';
import { CmdSendFile } from './tcphandler/sendfile';
import { CmdSendFileRequest } from './tcphandler/sendfilerequest';

import { TcpRemoteInfo } from './remoteinfo';
import { TcpCmdHandler } from './tcpcmdhandler';

export class TcpCmdDispatcher extends TcpCmdHandler {
  constructor(rinfo: TcpRemoteInfo) {
    super(rinfo);
    this.initStates();
  }

  protected initStates() {
    super.initStates();
    this.states.push({
      handle: this.dataVersionParser.bind(this),
      expectLen: () => { return 4; }
    });
    this.states.push({
      handle: this.cmdParser.bind(this),
      expectLen: () => { return 4; }
    });
    this.states.push({
      handle: this.dispatchCmd.bind(this)
    });
  }

  // private methods

  private dataVersionParser(data, state) {
    this.dataVer = data.readInt32BE(0);
    console.log(`read tcp data version: ${this.dataVer}`);
    return true;
  }

  private cmdParser(data, state) {
    this.cmd = data.readInt32BE(0);
    console.log(`read tcp cmd: ${this.cmd}`);
    return true;
  }

  private dispatchCmd(data: Buffer, state): boolean {
    let cmd = this.cmd;
    console.log(`dispach cmd: ${cmd}`);
    switch(cmd) {
      case config.cmd.phone.cmd_send_file:
        this.innerHandler = new CmdSendFile(this.dataVer, this._remoteInfo);
        break;
      case config.cmd.phone.cmd_send_file_request:
        this.innerHandler = new CmdSendFileRequest(this.dataVer, this._remoteInfo);
        break;
      default:
        console.log(`unknown cmd to dispatch cmd: ${cmd}`);
        return false;
    }

    if (this.innerHandler) {
      this.innerHandler.setReminderData(data);
    }

    return true;
  }
}
