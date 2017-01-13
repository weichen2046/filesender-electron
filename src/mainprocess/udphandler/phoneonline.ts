const { NetUtils } = require('../utils/network/netutils');
const { config } = require('../network/definitions');

export class CmdPhoneOnline {
  private sock = null;

  constructor(sock) {
    this.sock = sock;
  }

  public handle(data): boolean {
    let phoneUdpPort = data.readInt32BE();
    this.reportPcOnline(phoneUdpPort);
    return true;
  }

  // private methods

  private reportPcOnline(phonePort: number) {
    let broadcastAddr = NetUtils.getIpV4BroadcastAddress();
    if (broadcastAddr === null) {
      console.log('Can not report PC info for broadcast address is null');
      return;
    }

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
    console.log(`send pc online to broadcast addr: ${broadcastAddr}, phone port: ${phonePort}`);
    this.sock.send(msg, phonePort, broadcastAddr);
  }
}
