import { BufferUtil } from '../utils/buffer';
import { TcpRemoteInfo } from './remoteinfo';

export enum Result {
  Ok = 1,
  Finish,
  MoreData,
  Abort,
}

export abstract class TcpCmdHandler {
  protected _remoteInfo: TcpRemoteInfo = null;
  protected dataVer = -1;
  protected cmd = -1;
  protected innerHandler: TcpCmdHandler = null;
  protected remainderData: Buffer = null;
  protected stateIndex = 0;
  protected states = [];

  constructor(rinfo: TcpRemoteInfo) {
    this._remoteInfo = rinfo;
  }

  public handle(newData: Buffer): Result {
    if (this.innerHandler == null) {
      //console.log(`current stateIndex: ${this.stateIndex}`);
      if (this.stateIndex < this.states.length) {
        let state = this.states[this.stateIndex];
        let res = this.parseData(newData, state);
        if (res == Result.Ok) {
          this.stateIndex += 1;
        } else if (res == Result.Abort) {
          // TODO: some thing wrong with state[x], ignore or abort
          // we can return Ok or Abort according to state config here
          return Result.Abort;
        }
        return res;
      } else if (this.stateIndex == this.states.length) {
        this.allDataRecved();
        return Result.Finish;
      } else {
        console.log(`index out of states array, curr index: ${this.stateIndex}, states array length: ${this.states.length}`);
        return Result.Abort;
      }
    } else {
      return this.innerHandler.handle(newData);
    }
  }

  public end(): void {
    //console.log('TcpCmdHandler end called');
    if (this.innerHandler != null) {
      this.innerHandler.end();
    }
  }

  public setReminderData(data: Buffer) {
    this.remainderData = data;
  }

  protected parseData(data, state): Result {
    if (state.ignore !== undefined && state.ignore()) {
      //console.log('ignored state parse');
      return Result.Ok;
    }

    let expectLen = state.expectLen !== undefined ? state.expectLen() : 0;
    //console.log('expect length:', expectLen);
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    //console.log('before state handle availableData.length:', availableData === null ? 'null' : availableData.length);
    if (availableData == null) {
      console.log('no available data to parse');
      return Result.MoreData;
    }

    if (availableData.length >= expectLen) {
      let res = state.handle(availableData, state);
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        if (expectLen == 0) {
          this.remainderData = availableData;
        } else {
          this.remainderData = availableData.slice(expectLen);
        }
      }
      //console.log('after state handle remainderData.length:', this.remainderData === null ? 'null' : this.remainderData.length);
      return res ? Result.Ok : Result.Abort;
    } else {
      this.remainderData = availableData;
    }
    return Result.MoreData;
  }

  protected initStates(): void {
    this.stateIndex = 0;
  }
  protected allDataRecved(): void {
  }
}
