const { NetUtils } = require('../../utils/network/netutils');

import { config } from '../config';
import { Phone } from '../../message/phone';
import { UdpCmdHandler } from '../udpcmdhandler';
import { UdpRemoteInfo } from '../remoteinfo';
import { Runtime } from '../../runtime';

const uuid = require('uuid');

// Handle mobile device offline command from mobile device.
export class CmdPhoneOffline extends UdpCmdHandler {
  constructor(sock, rinfo: UdpRemoteInfo) {
    super(sock, rinfo);
  }

  public handle(data: Buffer): boolean {
    if (data.length < 4) {
      console.log('not enough data');
      return true;
    }

    let offset = 0;
    let runtime = Runtime.instance;

    if (data.length == 4) {
      let phoneUdpPort = data.readInt32BE(offset);
      // find phone by remote address and udp port
      let phone = runtime.findPhoneByAddressAndPort(this._remoteInfo.address, phoneUdpPort);
      // remove any nonauthenticated phone that match
      if (phone && !phone.accessToken) {
        runtime.deletePhone(phone);
      }
      return true;
    }

    // read auth token length
    let tokenLen = data.readInt32BE(offset);
    // read auth token
    offset += 4;
    let authToken = data.toString('utf8', offset, offset + tokenLen);
    // remove any authenticated phone that match the auth token
    let phone = runtime.authenticatePhoneToken(this._remoteInfo.address, authToken);
    if (phone) {
      runtime.deletePhone(phone);
    }

    return true;
  }
}
