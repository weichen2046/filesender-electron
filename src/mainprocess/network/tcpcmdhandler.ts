import { TcpRemoteInfo } from './remoteinfo';

const { BufferUtil } = require('../utils/buffer');

export abstract class TcpCmdHandler {
  protected _remoteInfo: TcpRemoteInfo = null;
  protected dataVer = -1;
  protected cmd = -1;
  protected innerHandler = null;
  protected remainderData = null;
  protected stateIndex = 0;
  protected states = [];

  constructor(rinfo: TcpRemoteInfo) {
    this._remoteInfo = rinfo;
  }

  public handle(data: Buffer) {
    if (this.innerHandler == null) {
      //console.log(`current stateIndex: ${this.stateIndex}`);
      if (this.stateIndex < this.states.length) {
        let state = this.states[this.stateIndex];
        let res = this.parseData(data, state);
        if (res) {
          this.stateIndex += 1;
          this.handle(null);
        }
      } else if (this.stateIndex == this.states.length) {
        this.allDataRecved();
      } else {
        console.log(`index out of states array, curr index: ${this.stateIndex}, states array length: ${this.states.length}`);
      }
    } else {
      this.innerHandler.handle(data);
    }
  }

  public end(): void {
    //console.log('TcpCmdHandler end called');
    if (this.innerHandler != null) {
      this.innerHandler.end();
    }
  }

  protected parseData(data, state): boolean {
    if (state.ignore !== undefined && state.ignore()) {
      //console.log('ignored state parse');
      return true;
    }

    let expectLen = state.expectLen !== undefined ? state.expectLen() : 0;
    //console.log('expect length:', expectLen);
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    //console.log('before state handle availableData.length:', availableData === null ? 'null' : availableData.length);
    if (availableData == null) {
      console.log('no available data to parse');
      return false;
    }

    if (availableData.length >= expectLen) {
      let res = state.handle(availableData, state);
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(expectLen);
      }
      //console.log('after state handle remainderData.length:', this.remainderData === null ? 'null' : this.remainderData.length);
      return res;
    } else {
      this.remainderData = availableData;
    }
    return false;
  }

  protected initStates(): void {
    this.stateIndex = 0;
  }
  protected allDataRecved(): void {
  }
}
