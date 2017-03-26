import { config } from './config';
import { UdpRemoteInfo } from './remoteinfo';

import { CmdPhoneOnline } from './udphandler/phoneonline';
import { CmdConfirmAuthRequest } from './udphandler/confirmauthrequest';
import { CmdConfirmExchangeTcpPort } from './udphandler/confirmexchangetcpport';

export class UdpCmdDispatcher {
  private _sock = null;

  constructor(sock) {
    this._sock = sock;
  }

  public handleCmd(dataVer: number, cmd: number, data, rinfo: UdpRemoteInfo): boolean {
    console.log(`handle cmd, data version: ${dataVer}, cmd: ${cmd}`);
    let res = true;
    switch(cmd) {
      case config.cmd.phone.cmd_phone_online:
        res = new CmdPhoneOnline(this._sock, rinfo).handle(data);
        break;
      case config.cmd.phone.cmd_confirm_auth_request:
        res = new CmdConfirmAuthRequest(this._sock, rinfo).handle(data);
        break;
      case config.cmd.phone.cmd_confirm_exchange_tcp_port:
        res = new CmdConfirmExchangeTcpPort(this._sock, rinfo).handle(data);
        break;
    }
    return res;
  }
}
