const { NetUtils } = require('../../utils/network/netutils');
const { config } = require('../config');

import { Phone } from '../../message/phone';
import { RemoteInfo } from '../udpdefs';
import { Runtime } from '../../runtime';

// Handle mobile device online command from mobile device.
export class CmdPhoneOnline {
  private sock = null;
  private _remoteInfo: RemoteInfo;

  constructor(sock, rinfo: RemoteInfo) {
    this.sock = sock;
    this._remoteInfo = rinfo;
  }

  public handle(data: Buffer): boolean {
    let offset = 0;
    let tokenLen = data.readInt32BE(offset);
    offset += 4;
    let token = data.toString('utf8', offset, offset + tokenLen);
    offset += tokenLen;
    let phoneUdpPort = data.readInt32BE(offset);

    let phone = new Phone();
    phone.online = true;
    phone.address = this._remoteInfo.address;
    phone.family = this._remoteInfo.family;
    phone.udpPort = phoneUdpPort;

    // TODO: check the phone exist or not according to the address and udp port
    Runtime.instance.phones.push(phone);
    // TODO: report PC online

    return true;
  }

  // private methods

  private reportPcOnline(phonePort: number) {
    let broadcastAddr = NetUtils.getIpV4BroadcastAddress();
    if (broadcastAddr === null) {
      console.log('Can not report PC info for broadcast address is null');
      return;
    }

    // 4 bytes -> data version
    // 4 bytes -> cmd
    // other bytes cmd data
    let dataLen = 4 + 4 + 4;
    let buffOffset = 0;
    let msg = Buffer.alloc(dataLen);
    msg.writeInt32BE(config.tcp.dataVer, buffOffset);
    buffOffset += 4;
    msg.writeInt32BE(config.cmd.pc.cmd_pc_online, buffOffset);
    buffOffset += 4;
    msg.writeInt32BE(config.tcp.port, buffOffset);
    console.log(`send pc online to broadcast addr: ${broadcastAddr}, phone port: ${phonePort}`);
    this.sock.send(msg, phonePort, broadcastAddr);
  }
}
