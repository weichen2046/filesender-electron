import { Phone } from '../../message/phone';
import { UdpRemoteInfo } from '../remoteinfo';
import { Runtime } from '../../runtime';

export class AuthPhoneHandler {
  protected _sock = null;
  protected _remoteInfo: UdpRemoteInfo;
  protected _phone: Phone;
  protected _startOffset: number;
  protected _runtime: Runtime;

  constructor(sock, rinfo: UdpRemoteInfo) {
    this._sock = sock;
    this._remoteInfo = rinfo;
  }

  public handle(data: Buffer): boolean {
    // 4 bytes -> access token length
    this._startOffset = 0;
    let tokenLen = data.readInt32BE(this._startOffset);
    // x bytes -> access token
    this._startOffset += 4;
    let authToken = data.toString('utf8', this._startOffset, this._startOffset + tokenLen);

    this._startOffset += tokenLen;

    // authenticate with access token
    this._runtime = Runtime.instance;
    this._phone = this._runtime.authenticatePhoneToken(this._remoteInfo.address, authToken);
    return this._phone !== undefined;
  }
}