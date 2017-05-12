import { config } from './config';
import { CmdSendFile } from './tcphandler/sendfilehandler';
import { CmdSendFileRequest } from './tcphandler/sendfilerequesthandler';
import { CmdConfirmSendingFileRequest } from './tcphandler/confirmsendingfilerequest';

import { TcpRemoteInfo } from './remoteinfo';
import { Result, TcpCmdHandler } from './tcpcmdhandler';

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

  private dataVersionParser(data, state): Result {
    this.dataVer = data.readInt32BE(0);
    console.log(`read tcp data version: ${this.dataVer}`);
    return Result.Ok;
  }

  private cmdParser(data, state): Result {
    this.cmd = data.readInt32BE(0);
    console.log(`read tcp cmd: ${this.cmd}`);
    return Result.Ok;
  }

  private dispatchCmd(data: Buffer, state): Result {
    let cmd = this.cmd;
    console.log(`dispach cmd: ${cmd}`);
    switch(cmd) {
      case config.cmd.phone.cmd_send_file:
        this.innerHandler = new CmdSendFile(this._remoteInfo, this.dataVer, this.cmd);
        break;
      case config.cmd.phone.cmd_sending_file_request:
        this.innerHandler = new CmdSendFileRequest(this._remoteInfo, this.dataVer, this.cmd);
        break;
      case config.cmd.phone.cmd_confirm_sending_file_request:
        this.innerHandler = new CmdConfirmSendingFileRequest(this._remoteInfo, this.dataVer, this.cmd);
        break;
      default:
        console.log(`unknown cmd to dispatch cmd: ${cmd}`);
        return Result.Abort;
    }

    if (this.innerHandler) {
      this.innerHandler.setReminderData(data);
    }

    return Result.Ok;
  }
}
