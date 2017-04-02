import { UdpRemoteInfo } from './remoteinfo';

export abstract class UdpCmdHandler {
  protected _sock = null;
  protected _remoteInfo: UdpRemoteInfo;

  constructor(sock, rinfo: UdpRemoteInfo) {
    this._sock = sock;
    this._remoteInfo = rinfo;
  }

  public abstract handle(data: Buffer): boolean;
}