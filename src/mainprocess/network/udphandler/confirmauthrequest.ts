import { AuthPhoneHandler } from './authphonehandler';
import { config } from '../config';
import { Phone } from '../../message/phone';
import { RemoteInfo } from '../udpdefs';
import { Runtime } from '../../runtime';

export class CmdConfirmAuthRequest extends AuthPhoneHandler {
  constructor(sock, rinfo: RemoteInfo) {
    super(sock, rinfo);
  }

  public handle(data: Buffer): boolean {
    let res = super.handle(data);
    if (!res) {
      return false;
    }

    // 1 bytes -> confirm state
    let accept: boolean = data.readInt8(this._startOffset) == 1;
    //console.log('authToken:', authToken, 'accept:', accept);
    if (accept) {
      // 4 bytes -> phone access token length
      this._startOffset += 1;
      let tokenLen = data.readInt32BE(this._startOffset);
      // x bytes -> phone access token
      this._startOffset += 4;
      let accessToken = data.toString('utf8', this._startOffset, this._startOffset + tokenLen);
      //console.log('accessToken:', accessToken);
      this._phone.accessToken = accessToken;

      // exchange tcp listen port
      this.exhangeTcpListenPort(this._phone);
    } else {
        // delete from runtime
        this._runtime.deletePhone(this._phone);
    }
    //console.log('runtime.phones:', runtime.phones);
    return true;
  }

  private exhangeTcpListenPort(phone: Phone) {
    // 4 bytes -> data version
    // 4 bytes -> cmd
    // 4 bytes -> access token length
    // x bytes -> access token
    // 4 bytes -> tcp listen port
    let dataLen = 4 + 4 + 4 + phone.accessToken.length + 4;
    let msg = Buffer.alloc(dataLen);
    // write data version
    let buffOffset = 0;
    msg.writeInt32BE(config.tcp.dataVer, buffOffset);
    // write cmd
    buffOffset += 4;
    msg.writeInt32BE(config.cmd.pc.cmd_exchange_tcp_port, buffOffset);
    // write access token length
    buffOffset += 4;
    msg.writeInt32BE(phone.accessToken.length, buffOffset);
    // write access token
    buffOffset += 4;
    msg.write(phone.accessToken, buffOffset, phone.accessToken.length);
    // write tcp port
    buffOffset += phone.accessToken.length;
    msg.writeInt32BE(config.tcp.port, buffOffset);
    //console.log(`exchange tcp port phone: ${phone.address}, phone port: ${phone.udpPort}`);
    this._sock.send(msg, phone.udpPort, phone.address);
  }
}