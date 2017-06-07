const { NetUtils } = require('../../utils/network/netutils');

import { config } from '../config';
import { Phone } from '../../message/phone';
import { UdpCmdHandler } from '../udpcmdhandler';
import { UdpRemoteInfo } from '../remoteinfo';
import { Runtime } from '../../runtime';

const uuid = require('uuid');

// Handle mobile device online command from mobile device.
export class CmdPhoneOnline extends UdpCmdHandler {
  constructor(sock, rinfo: UdpRemoteInfo) {
    super(sock, rinfo);
  }

  public handle(data: Buffer): boolean {
    let offset = 0;
    let tokenLen = data.readInt32BE(offset);
    offset += 4;
    let tempToken = data.toString('utf8', offset, offset + tokenLen);
    offset += tokenLen;
    let phoneUdpPort = data.readInt32BE(offset);

    let phone = new Phone();
    phone.online = true;
    phone.address = this._remoteInfo.address;
    phone.family = this._remoteInfo.family;
    phone.udpPort = phoneUdpPort;

    // check the phone exist or not according to the address and udp port
    let runtime = Runtime.instance;
    let p = runtime.findPhoneByPhone(phone);
    if (p) {
      // reset access token and auth token
      p.accessToken = null;
      p.authToken = null;
      phone = p;
    } else {
      runtime.phones.push(phone);
    }
    // send auth request to phone
    phone.authToken = uuid.v1().replace(/-/g, '');
    this.requestAuth(phone, tempToken);
    return true;
  }

  // private methods

  private requestAuth(phone: Phone, tempToken: string) {
    let broadcastAddr = NetUtils.getIpV4BroadcastAddress();
    if (broadcastAddr === null) {
      console.log('Can not report PC info for broadcast address is null');
      return;
    }

    // 4 bytes -> data version
    // 4 bytes -> cmd
    // 4 bytes -> temp access token length
    // x bytes -> temp access token
    // 4 bytes -> device type
    // 4 bytes -> auth token length
    // x bytes -> auth token
    // 4 bytes -> pc udp port
    let dataLen = 4 + 4 + 4 + 4 + tempToken.length + 4 + phone.authToken.length + 4;
    let msg = Buffer.alloc(dataLen);
    // write data version
    let buffOffset = 0;
    msg.writeInt32BE(config.udp.dataVer, buffOffset);
    // write cmd
    buffOffset += 4;
    msg.writeInt32BE(config.cmd.pc.cmd_request_auth, buffOffset);
    // write temp access token length
    buffOffset += 4;
    msg.writeInt32BE(tempToken.length, buffOffset);
    // write temp access token
    buffOffset += 4;
    msg.write(tempToken, buffOffset, tempToken.length);
    // write device type, 1 = Desktop Type
    buffOffset += tempToken.length;
    msg.writeInt32BE(1, buffOffset);
    // write auth token length
    buffOffset += 4;
    msg.writeInt32BE(phone.authToken.length, buffOffset);
    // write auth token
    buffOffset += 4;
    msg.write(phone.authToken, buffOffset, phone.authToken.length);
    // write pc udp port
    buffOffset += phone.authToken.length;
    msg.writeInt32BE(config.udp.port, buffOffset);
    console.log(`send auth request phone, addr: ${phone.address}, phone port: ${phone.udpPort}`);
    this._sock.send(msg, phone.udpPort, phone.address);
  }
}
