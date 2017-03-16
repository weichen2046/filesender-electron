import { CmdPhoneOnline } from './udphandler/phoneonline';
const { config } = require('./config');

import { RemoteInfo } from './udpdefs';

export class UdpCmdDispatcher {
  private sock = null;

  constructor(sock) {
    this.sock = sock;
  }

  public handleCmd(dataVer: number, cmd: number, data, rinfo: RemoteInfo): boolean {
    console.log(`handle cmd, data version: ${dataVer}, cmd: ${cmd}`);
    let res = true;
    switch(cmd) {
      case config.cmd.phone.cmd_phone_online:
        res = new CmdPhoneOnline(this.sock, rinfo).handle(data);
    }
    return res;
  }
}
