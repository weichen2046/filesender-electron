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
}