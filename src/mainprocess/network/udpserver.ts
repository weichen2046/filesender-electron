const dgram = require('dgram');

const { config } = require('./definitions');
const { NetUtils } = require('../utils/network/netutils');
const { UdpCmdDispatcher } = require('./udpcmddispatcher');

export class UdpServer {
  private sock = null;
  private dispacher = null;

  constructor() {
    this.sock = dgram.createSocket('udp4');
    this.init();
    this.dispacher = new UdpCmdDispatcher(this.sock);

    console.log('ip address:', NetUtils.getIpV4IpAddress());
    console.log('netmask address:', NetUtils.getIpV4Netmask());
    console.log('broadcast address:', NetUtils.getIpV4BroadcastAddress());
  }

  public startServer() {
    console.log('Start local UDP server...');
    this.sock.bind(config.udp.port, this.onServerBind.bind(this));
  }

  public stopServer() {
    console.log('Stop local UDP server...');
    this.sock.close();
    this.sock = null;
  }

  private init() {
    this.sock.on('error', this.onServerError.bind(this));
    this.sock.on('message', this.onServerMessage.bind(this));
    this.sock.on('listening', this.onServerListening.bind(this));
  }

  private onServerError(err) {
    console.log(`udp server error:\n${err.stack}`);
    this.sock.close();
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
    let address = this.sock.address();
    console.log(`udp server listening ${address.address}:${address.port}`);
  }

  private onServerBind() {
    this.sock.setBroadcast(true);
  }

}