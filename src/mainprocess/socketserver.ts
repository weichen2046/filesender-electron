const dgram = require('dgram');

export class UdpServer {
  private server = null;

  constructor() {
    this.server = dgram.createSocket('udp4');
    this.init();
  }

  public startServer() {
    console.log('Start local UDP server...');
    this.server.bind(41234);
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
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    this.server.send('Whatx', rinfo.port, rinfo.address);
  }

  private onServerListening() {
    let address = this.server.address();
    console.log(`server listening ${address.address}:${address.port}`);
  }

}
