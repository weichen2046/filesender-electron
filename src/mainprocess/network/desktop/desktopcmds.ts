const dgram = require('dgram');

import { config } from '../config';
import { NetUtils } from '../../utils/network/netutils';
import { Runtime } from '../../runtime';

export class DesktopCmds {
  public static broadcastDesktopOnline() {
    let broadcastAddr = NetUtils.getIpV4BroadcastAddress();
    if (broadcastAddr === null) {
      console.log('Can not report PC info for broadcast address is null');
      return;
    }

    let runtime = Runtime.instance;
    let phonePort = config.mobile.default_udp_port;

    let client = dgram.createSocket('udp4');
    client.bind(() => {
      client.setBroadcast(true);
      // 4 bytes data version
      // 4 bytes cmd
      // 4 bytes token length
      // x bytes token
      // 4 bytes udp port
      let dataLen = 4 + 4 + 4 + runtime.tempAccessToken.length + 4;
      let msg = Buffer.alloc(dataLen);
      // write version
      let buffOffset = 0;
      msg.writeInt32BE(config.udp.dataVer, buffOffset);
      // write cmd
      buffOffset += 4;
      msg.writeInt32BE(config.cmd.pc.cmd_pc_online, buffOffset);
      // write token length
      buffOffset += 4;
      msg.writeInt32BE(runtime.tempAccessToken.length, buffOffset);
      // write token
      buffOffset += 4;
      msg.write(runtime.tempAccessToken, buffOffset);
      // write udp port
      buffOffset += runtime.tempAccessToken.length;
      msg.writeInt32BE(config.udp.port, buffOffset);
      console.log(`send desktop online to broadcast addr: ${broadcastAddr}, phone port: ${phonePort}, temp token: ${runtime.tempAccessToken}`);
      client.send(msg, phonePort, broadcastAddr, (err) => {
        client.close();
        client = null;
      });
    });
  }

  public static broadcastDesktopOffline() {
    let client = dgram.createSocket('udp4');
    client.bind(() => {
      client.setBroadcast(true);

      let broadcastFinished = false;
      let closeSocket = false;

      // 1) send broadcast
      let broadcastAddr = NetUtils.getIpV4BroadcastAddress();
      let phonePort = config.mobile.default_udp_port;
      if (broadcastAddr !== null) {
        // 4 bytes data version
        // 4 bytes cmd
        // 1 bytes broadcast indicator
        // 4 bytes desktop udp port
        let dataLen = 4 + 4 + 1 + 4;
        let msg = Buffer.alloc(dataLen);
        // write version
        let buffOffset = 0;
        msg.writeInt32BE(config.tcp.dataVer, buffOffset);
        // write cmd
        buffOffset += 4;
        msg.writeInt32BE(config.cmd.pc.cmd_pc_offline, buffOffset);
        // write broadcast indicator
        buffOffset += 4;
        msg.writeInt8(0, buffOffset);
        // write udp port
        buffOffset += 1;
        msg.writeInt32BE(config.udp.port, buffOffset);
        console.log(`send desktop offline to broadcast addr: ${broadcastAddr}, phone port: ${phonePort}`);
        client.send(msg, phonePort, broadcastAddr, (err) => {
          broadcastFinished = true;
          if (closeSocket) {
            client.close();
            client = null;
          }
        });
      } else {
        console.log('Can not report PC info for broadcast address is null');
      }

      // 2) send to each authenticated phone
      let phones = Runtime.instance.phones.filter(p => {
        return p.accessToken !== undefined && p.accessToken.length != 0;
      });
      if (phones.length == 0) {
        console.log('no authenticated phone to send desktop offline');
        closeSocket = true;
        if (broadcastFinished) {
          client.close();
          client = null;
        }
        return;
      }
      phones.forEach((p, index) => {
        // 4 bytes data version
        // 4 bytes cmd
        // 1 bytes broadcast indicator
        // 4 bytes access token length
        // x bytes access token
        let dataLen = 4 + 4 + 1 + 4 + p.accessToken.length;
        let msg = Buffer.alloc(dataLen);
        // write version
        let buffOffset = 0;
        msg.writeInt32BE(config.tcp.dataVer, buffOffset);
        // write cmd
        buffOffset += 4;
        msg.writeInt32BE(config.cmd.pc.cmd_pc_offline, buffOffset);
        // write broadcast indicator
        buffOffset += 4;
        msg.writeInt8(1, buffOffset);
        // write token length
        buffOffset += 1;
        msg.writeInt32BE(p.accessToken.length, buffOffset);
        // write token
        buffOffset += 4;
        msg.write(p.accessToken, buffOffset);
        console.log('send desktop offline to pc:', p.address, 'udpPort:', p.udpPort);
        client.send(msg, p.udpPort, p.address, (err) => {
          if (index === (phones.length - 1)) {
            console.log('close socket after all offline cmd sent');
            client.close();
            client = null;
          }
        });
      })
    });
  }
}
