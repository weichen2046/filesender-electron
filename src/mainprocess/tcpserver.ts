const net = require('net');

const { config } = require('./network/definitions');

export class TcpServer {
  private server = null;

  constructor() {
    this.server = net.createServer();
    this.initServer();
  }

  public startServer() {
    console.log('Start local TCP server...');
    this.server.listen(config.tcp.port);
  }

  public stopServer() {
    console.log('Stop local TCP server...');
    this.server.close();
  }

  // private methods

  private initServer() {
    this.server.on('error', this.onServerError.bind(this));
    this.server.on('listening', this.onServerListening.bind(this));
    this.server.on('connection', this.onClientConnected.bind(this));
    this.server.on('close', this.onServerClosed.bind(this));
  }

  private onServerError(err) {
    console.log('tcp server error', err);
  }

  private onServerListening() {
    let address = this.server.address();
    console.log(`tcp server listening, port: ${address.port}, family: ${address.family}, address: ${address.address}`);
  }

  private onServerClosed() {
    console.log('tp server closed');
    this.server = null;
  }

  private onClientConnected(clientSock) {
    console.log(`client connected, address: ${clientSock.address()}`);
    clientSock.end();
  }

}
