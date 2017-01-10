const { CmdPhoneOnline } = require('./udphandler/phoneonline');

export class UdpCmdDispatcher {
  constructor() {
  }

  public handleCmd(dataVer: number, cmd: number, data): boolean {
    console.log(`handle cmd, data version: ${dataVer}, cmd: ${cmd}`);
    let res = true;
    switch(cmd) {
      case 1: 
	res = new CmdPhoneOnline().handle(data);
    }
    return res;
  }
}
