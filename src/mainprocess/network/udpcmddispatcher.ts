const { CmdPhoneOnline } = require('./udphandler/phoneonline');
const { config } = require('./config');

export class UdpCmdDispatcher {
  private sock = null;

  constructor(sock) {
    this.sock = sock;
  }

  public handleCmd(dataVer: number, cmd: number, data): boolean {
    console.log(`handle cmd, data version: ${dataVer}, cmd: ${cmd}`);
    let res = true;
    switch(cmd) {
      case config.cmd.phone.cmd_phone_online:
	res = new CmdPhoneOnline(this.sock).handle(data);
    }
    return res;
  }
}
