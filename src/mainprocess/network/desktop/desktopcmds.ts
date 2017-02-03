const dgram = require('dgram');

import { config } from '../config';
import { NetUtils } from '../../utils/network/netutils';

export class DesktopCmds {
  public static broadcastDesktopOnline() {
    let broadcastAddr = NetUtils.getIpV4BroadcastAddress();
    if (broadcastAddr === null) {
      console.log('Can not report PC info for broadcast address is null');
      return;
    }

    let phonePort = config.mobile.default_udp_port;

    let client = dgram.createSocket('udp4');
    client.bind(() => {
      client.setBroadcast(true);
      // 4 bytes data version
      // 4 bytes cmd
      // other bytes cmd data
      let dataLen = 4 + 4 + 4;
      let buffOffset = 0;
      let msg = Buffer.alloc(dataLen);
      msg.writeInt32BE(config.tcp.dataVer, buffOffset);
      buffOffset += 4;
      msg.writeInt32BE(config.cmd.pc.cmd_pc_online, buffOffset);
      buffOffset += 4;
      msg.writeInt32BE(config.tcp.port, buffOffset);
      console.log(`send desktop online to broadcast addr: ${broadcastAddr}, phone port: ${phonePort}`);
      client.send(msg, phonePort, broadcastAddr, (err) => {
	client.close();
	client = null;
      });
    });
  }

  public static broadcastDesktopOffline() {
    let broadcastAddr = NetUtils.getIpV4BroadcastAddress();
    if (broadcastAddr === null) {
      console.log('Can not report PC info for broadcast address is null');
      return;
    }

    let phonePort = config.mobile.default_udp_port;

    let client = dgram.createSocket('udp4');
    client.bind(() => {
      client.setBroadcast(true);
      // 4 bytes data version
      // 4 bytes cmd
      // other bytes cmd data
      let dataLen = 4 + 4;
      let buffOffset = 0;
      let msg = Buffer.alloc(dataLen);
      msg.writeInt32BE(config.tcp.dataVer, buffOffset);
      buffOffset += 4;
      msg.writeInt32BE(config.cmd.pc.cmd_pc_offline, buffOffset);
      console.log(`send desktop offline to broadcast addr: ${broadcastAddr}, phone port: ${phonePort}`);
      client.send(msg, phonePort, broadcastAddr, (err) => {
	client.close();
	client = null;
      });
    });
  }
}
