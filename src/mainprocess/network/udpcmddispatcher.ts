import { config } from './config';
import { UdpCmdHandler } from './udpcmdhandler';
import { UdpRemoteInfo } from './remoteinfo';

import { CmdPhoneOffline } from './udphandler/phoneoffline';
import { CmdPhoneOnline } from './udphandler/phoneonline';
import { CmdConfirmAuthRequest } from './udphandler/confirmauthrequest';
import { CmdConfirmExchangeTcpPort } from './udphandler/confirmexchangetcpport';

export class UdpCmdDispatcher {
  private _sock = null;

  constructor(sock) {
    this._sock = sock;
  }

  public handleCmd(dataVer: number, cmd: number, data, rinfo: UdpRemoteInfo): boolean {
    console.log(`handle udp cmd, data version: ${dataVer}, cmd: ${cmd}`);
    let res = true;
    let handler: UdpCmdHandler = null;
    switch(cmd) {
      case config.cmd.phone.cmd_phone_online:
        handler = new CmdPhoneOnline(this._sock, rinfo);
        break;
      case config.cmd.phone.cmd_phone_offline:
        handler = new CmdPhoneOffline(this._sock, rinfo);
        break;
      case config.cmd.phone.cmd_confirm_auth_request:
        handler = new CmdConfirmAuthRequest(this._sock, rinfo);
        break;
      case config.cmd.phone.cmd_confirm_exchange_tcp_port:
        handler = new CmdConfirmExchangeTcpPort(this._sock, rinfo);
        break;
    }
    if (handler) {
      res = handler.handle(data);
    }
    return res;
  }
}
