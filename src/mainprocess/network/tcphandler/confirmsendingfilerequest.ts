import { AuthPhoneCmdHandler } from './authphonecmdhandler';
import { TcpRemoteInfo } from '../remoteinfo';
import { Result } from '../tcpcmdhandler';

export class CmdConfirmSendingFileRequest extends AuthPhoneCmdHandler {
  private accept: boolean;
  private fileIdCount: number;
  private fileIdArray: string[] = [];
  private _fileIdLengthArray: number[] = [];
  private _currIdPaserIndex = 0;

  constructor(rinfo: TcpRemoteInfo, dataVer, cmd) {
    super(rinfo, dataVer, cmd);
  }

  protected onInitStates() {
    super.onInitStates();
    this.states.push({
      handle: this.acceptStateParser.bind(this),
      expectLen: () => { return 1; }
    });
    this.states.push({
      handle: this.fileIdCountParser.bind(this),
      expectLen: () => { return 4; },
      ignore: () => { return !this.accept; }
    });
  }

  // private methods

  private acceptStateParser(data, state): Result {
    this.accept = data.readInt8(0) == 1;
    console.log(`read accept state: ${this.accept}`);
    return Result.Ok;
  }

  private fileIdCountParser(data, state): Result {
    this.fileIdCount = data.readInt32BE(0);
    console.log(`read file id count: ${this.fileIdCount}`);
    for(let i=0; i<this.fileIdCount; i++) {
      this.states.push({
        handle: this.fileIdLengthParser.bind(this),
        expectLen: () => { return 4; }
      });
      this.states.push({
        handle: this.fileIdParser.bind(this),
        expectLen: () => { return this._fileIdLengthArray[this._currIdPaserIndex]; }
      });
    }
    return Result.Ok;
  }

  private fileIdLengthParser(data, state): Result {
    let length = data.readInt32BE(0);
    console.log(`read file id[${this._currIdPaserIndex}] length: ${length}`);
    this._fileIdLengthArray[this._currIdPaserIndex] = length;
    return Result.Ok;
  }

  private fileIdParser(data, state): Result {
    let fileId = data.toString('utf8', 0, this._fileIdLengthArray[this._currIdPaserIndex]);
    console.log(`read file id[${this._currIdPaserIndex}]: ${fileId}`);
    this.fileIdArray[this._currIdPaserIndex] = fileId;
    this._currIdPaserIndex += 1;
    return Result.Ok;
  }

  protected allDataRecved() {
    console.log('allDataRecved, fileIds:', this.fileIdArray);
    if (this.fileIdArray.length > 0) {
      // TODO: query file by file id from runtime
      // TODO: send file to remote device
    }
  }
}