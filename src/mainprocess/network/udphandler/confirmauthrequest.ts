import { RemoteInfo } from '../udpdefs';
import { Runtime } from '../../runtime';

export class CmdConfirmAuthRequest {
  private _sock = null;
  private _remoteInfo: RemoteInfo;

  constructor(sock, rinfo: RemoteInfo) {
    this._sock = sock;
    this._remoteInfo = rinfo;
  }

  public handle(data: Buffer): boolean {
    // 4 bytes -> access token length
    let offset = 0;
    let tokenLen = data.readInt32BE(offset);
    // x bytes -> access token
    offset += 4;
    let authToken = data.toString('utf8', offset, offset + tokenLen);

    // TODO: authenticate with access token
    let runtime = Runtime.instance;
    let p = runtime.authenticatePhoneToken(this._remoteInfo.address, authToken);
    //console.log('auth phone:', p);

    if (!p) {
      console.log('phone authenticate failed.');
      return;
    }

    // if auth pass then
    // 1 bytes -> confirm state
    offset += tokenLen;
    let accept: boolean = data.readInt8(offset) == 1;
    //console.log('authToken:', authToken, 'accept:', accept);
    if (accept) {
      // 4 bytes -> phone access token length
      offset += 1;
      tokenLen = data.readInt32BE(offset);
      // x bytes -> phone access token
      offset += 4;
      let accessToken = data.toString('utf8', offset, offset + tokenLen);
      //console.log('accessToken:', accessToken);
      p.accessToken = accessToken;
    } else {
        // delete from runtime
        runtime.deletePhone(p);
    }
    //console.log('runtime.phones:', runtime.phones);
    return true;
  }
}