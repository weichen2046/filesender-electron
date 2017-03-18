import { Phone } from './message/phone';

export class Runtime {
  private static _instance: Runtime;
  private _phones: Phone[] = [];

  static get instance(): Runtime {
    if (!Runtime._instance) {
      Runtime._instance = new Runtime();
    }
    return Runtime._instance;
  }

  get phones(): Phone[] {
    return this._phones;
  }

  public findPhone(phone: Phone): Phone|undefined {
    let res = this._phones.find(p => {
      return p.address === phone.address && p.udpPort === phone.udpPort;
    });
    return res;
  }
}