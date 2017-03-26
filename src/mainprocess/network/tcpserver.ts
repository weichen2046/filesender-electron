const net = require('net');

const { config } = require('./config');
const { NetUtils } = require('../utils/network/netutils');

import { TcpCmdDispatcher } from './tcpcmddispatcher';
import { NetworkServerCallback } from '../networkservercallback';

export class TcpServer {
  private server = null;

  constructor(private callback: NetworkServerCallback) {
    this.server = net.createServer();
    this.initServer();
  }

  public startServer() {
    console.log('Start local TCP server...');
    let ipAddr = NetUtils.getIpV4IpAddress();
    if (ipAddr === null) {
      console.log('TCP server can not listen for null ip');
      return;
    }
    this.server.listen(config.tcp.port, ipAddr);
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
    this.callback.onServerStarted();
  }

  private onServerClosed() {
    console.log('tcp server closed');
    this.server = null;
    this.callback.onServerStopped();
  }

  private onClientConnected(sock) {
    console.log(`client connected, remote port: ${sock.remotePort}, remote family: ${sock.remoteFamily}, address: ${sock.remoteAddress}`);
    let tcpDispatcher = new TcpCmdDispatcher({address: sock.remoteAddress, family: sock.remoteFamily, port: sock.remotePort});
    sock.on('data', (data) => {
      //console.log('received client data, length:', data.length);
      tcpDispatcher.handle(data);
    });

    sock.on('end', () => {
      console.log(`client closed, remote port: ${sock.remotePort}, remote family: ${sock.remoteFamily}, address: ${sock.remoteAddress}`);
      tcpDispatcher.end();
    });
  }

}
