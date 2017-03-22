import { AuthPhoneHandler } from './authphonehandler';
import { RemoteInfo } from '../udpdefs';
import { Runtime } from '../../runtime';

export class CmdConfirmExchangeTcpPort extends AuthPhoneHandler {
  constructor(sock, rinfo: RemoteInfo) {
    super(sock, rinfo);
  }

  public handle(data: Buffer): boolean {
    let res = super.handle(data);
    if (res) {
      // 4 bytes -> tcp port
      let tcpPort = data.readInt32BE(this._startOffset);
      console.log('exchange tcp port, phone tcp port:', tcpPort);
      this._phone.tcpPort = tcpPort;
    }
    return res;
  }
}