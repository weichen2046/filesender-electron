export interface TcpRemoteInfo {
  address: string;
  family: string;
  port: number;
}

export interface UdpRemoteInfo extends TcpRemoteInfo {
  size: number;
}