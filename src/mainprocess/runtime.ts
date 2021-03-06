import { Phone } from './message/phone';

const uuid = require('uuid');

import { PendingSendingFile, PendingSendingFileManager } from './runtimex';

export class Runtime {
  private static _instance: Runtime;
  private _phones: Phone[] = [];
  private _tempAccessToken: string;

  public pendingFileManager: PendingSendingFileManager;

  constructor() {
    this.pendingFileManager = new PendingSendingFileManager();
  }

  static get instance(): Runtime {
    if (!Runtime._instance) {
      Runtime._instance = new Runtime();
    }
    return Runtime._instance;
  }

  get tempAccessToken(): string {
    if (!this._tempAccessToken) {
      this._tempAccessToken = uuid.v1().replace(/-/g, '');
    }
    return this._tempAccessToken;
  }

  get phones(): Phone[] {
    return this._phones;
  }

  public deletePhone(phone: Phone): Phone|boolean {
    let index = this._phones.findIndex(p => {
      return p.address === phone.address && p.udpPort == phone.udpPort;
    });
    if (index == -1) {
      return false;
    }
    return this._phones.splice(index, 1)[0];
  }

  public findPhoneByPhone(phone: Phone): Phone|undefined {
    let res = this._phones.find(p => {
      return p.address === phone.address && p.udpPort === phone.udpPort;
    });
    return res;
  }

  public findPhoneByAddressAndPort(address: String, udpPort: number): Phone|undefined {
    let res = this._phones.find(p => {
      return p.address === address && p.udpPort === udpPort;
    });
    return res;
  }

  public authenticatePhoneToken(address: string, token: string): Phone|undefined {
    let res = this._phones.find(p => {
      if (p.address === address) {
        if (p.authToken === token) {
          return true;
        }
      }
      return false;
    });
    return res;
  }
}