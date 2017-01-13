const { BufferUtil } = require('../utils/buffer');
const Int64 = require('node-int64');

export class CmdSendFile {
  private innerHandler = null;
  private remainderData = null;
  private stateIndex = 0;
  private states = [];

  private dataVer = -1;

  private fileName = null;
  private fileNameLen = 0;
  private fileContentLen = 0;
  private recvFileLen = 0;

  constructor(dataVer) {
    this.dataVer = dataVer;
    this.initStates();
  }

  public handle(data) {
    if (this.innerHandler == null) {
      //console.log(`current stateIndex: ${this.stateIndex}`);
      if (this.stateIndex < this.states.length) {
        let state = this.states[this.stateIndex];
        state.handle(data);
      } else {
        console.log(`index out of states array, curr index: ${this.stateIndex}, states array length: ${this.states.length}`);
      }
    } else {
      this.innerHandler.handle(data);
    }
  }

  public end() {
    if (this.innerHandler != null) {
      this.innerHandler.end();
    }
    console.log(`all received file content length: ${this.recvFileLen}`);
    // TODO: close file
  }

  // private methods

  private initStates() {
    this.stateIndex = 0;
    this.states.push({
      handle: this.fileNameLengthParser.bind(this)
    });
    this.states.push({
      handle: this.fileNameParser.bind(this)
    });
    this.states.push({
      handle: this.fileContentLengthParser.bind(this)
    });
    this.states.push({
      handle: this.fileContentParser.bind(this)
    });
  }

  private fileNameLengthParser(data) {
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return;
    }

    if (availableData.length >= 4) {
      this.fileNameLen = availableData.readInt32BE(0);
      console.log(`read file name length: ${this.fileNameLen}`);
      this.stateIndex += 1;
      if (availableData.length == 4) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(4);
        this.handle(null);
      }
    } else {
      this.remainderData = availableData;
    }
  }

  private fileNameParser(data) {
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return;
    }

    if (availableData.length >= this.fileNameLen) {
      this.fileName = availableData.toString('utf8', 0, this.fileNameLen);
      console.log(`read file name: ${this.fileName}`);
      this.stateIndex += 1;
      if (availableData.length == this.fileNameLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(this.fileNameLen);
        this.handle(null);
      }
    } else {
      this.remainderData = availableData;
    }
  }

  private fileContentLengthParser(data) {
    let expectLen = 8;
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return;
    }

    if (availableData.length >= expectLen) {
      let int64 = new Int64(availableData, 0);
      this.fileContentLen = int64.toNumber(true);
      console.log(`read file content length: ${this.fileContentLen}`);
      this.stateIndex += 1;
      if (availableData.length == expectLen) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(expectLen);
      }
      this.handle(this.remainderData);
      this.remainderData = null;
    } else {
      this.remainderData = availableData;
    }
  }

  private fileContentParser(data) {
    if (this.recvFileLen == 0) {
      // TODO: create file
    }

    if (data != null) {
      this.recvFileLen += data.length;
    }
  }
}