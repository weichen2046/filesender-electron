import { Phone } from '../../message/phone';
import { Runtime } from '../../runtime';
import { Result, TcpCmdHandler } from '../tcpcmdhandler';
import { TcpRemoteInfo } from '../remoteinfo';

export class AuthPhoneCmdHandler extends TcpCmdHandler {
  protected tokenLen = 0;
  protected authToken = null;
  protected authPhone: Phone;

  constructor(rinfo: TcpRemoteInfo, dataVer, cmd) {
    super(rinfo, dataVer, cmd);
  }

  protected onInitStates() {
    super.onInitStates();
    this.states.push({
      handle: this.tokenLengthParser.bind(this),
      expectLen: () => { return 4; }
    });
    this.states.push({
      handle: this.authTokenParser.bind(this),
      expectLen: () => { return this.tokenLen; }
    });
  }

  // private methods

  private tokenLengthParser(data, state): Result {
    this.tokenLen = data.readInt32BE(0);
    console.log(`read auth token length: ${this.tokenLen}`);
    return Result.Ok;
  }

  private authTokenParser(data, state): Result {
    this.authToken = data.toString('utf8', 0, this.tokenLen);
    console.log(`read auth token: ${this.authToken}`);
    // authenticate with auth token
    this.authPhone = Runtime.instance.authenticatePhoneToken(this._remoteInfo.address, this.authToken);
    if (this.authPhone) {
      return Result.Ok;
    } else {
      return Result.Abort;
    }
  }
}