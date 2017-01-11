const { NetUtils } = require('../utils/network/netutils');
const { config } = require('../network/definitions');

export class CmdPhoneOnline {
  private sock = null;

  constructor(sock) {
    this.sock = sock;
  }

  public handle(data): boolean {
    let phoneUdpPort = data.readInt32BE();
    console.log(`phone udp listen port: ${phoneUdpPort}`);
    this.reportPcOnline(phoneUdpPort);
    return true;
  }

  // private methods

  private reportPcOnline(phonePort: number) {
    let broadcastAddr = NetUtils.getBroadcastAddress();
    if (broadcastAddr === null) {
      console.log('Can not report PC info for broadcast address is null');
      return;
    }

    // 4 bytes data version
    // 4 bytes cmd
    // other bytes cmd data
    let msg = Buffer.alloc(4 + 4 + 4);
    msg.writeInt32BE(config.tcp.dataVer, 0);
    msg.writeInt32BE(1, 4);
    msg.writeInt32BE(config.tcp.port, 4);
    this.sock.send('msg', phonePort, broadcastAddr);
  }
}
