const dgram = require('dgram');

const { UdpCmdDispatcher } = require('./udpcmddispatcher');

export class UdpServer {
  private server = null;
  private dispacher = null;

  constructor() {
    this.dispacher = new UdpCmdDispatcher();
    this.server = dgram.createSocket('udp4');
    this.init();
  }

  public startServer() {
    console.log('Start local UDP server...');
    this.server.bind(4555);
  }

  public stopServer() {
    console.log('Stop local UDP server...');
    this.server.close();
    this.server = null;
  }

  private init() {
    this.server.on('error', this.onServerError.bind(this));
    this.server.on('message', this.onServerMessage.bind(this));
    this.server.on('listening', this.onServerListening.bind(this));
  }

  private onServerError(err) {
    console.log(`server error:\n${err.stack}`);
    this.server.close();
  }

  private onServerMessage(msg, rinfo) {
    // 4 bytes cmd version
    // 4 bytes cmd
    // rest bytes message of cmd
    let ver = msg.readInt32BE(0);
    let cmd = msg.readInt32BE(4);
    let data = msg.slice(8);
    this.dispacher.handleCmd(ver, cmd, data);
  }

  private onServerListening() {
    let address = this.server.address();
    console.log(`server listening ${address.address}:${address.port}`);
  }

}
