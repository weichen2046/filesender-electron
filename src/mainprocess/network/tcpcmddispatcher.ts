const { BufferUtil } = require('../utils/buffer');
const { config } = require('./definitions');
const { CmdSendFile } = require('./tcphandler/sendfile');

export class TcpCmdDispatcher {
  private innerHandler = null;
  private remainderData = null;
  private stateIndex = 0;
  private states = [];

  private dataVer = -1;
  private cmd = -1;

  constructor() {
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
  }

  // private methods

  private initStates() {
    this.stateIndex = 0;
    this.states.push({
      handle: this.dataVersionHandler.bind(this)
    });
    this.states.push({
      handle: this.cmdHandler.bind(this)
    });
  }

  private dataVersionHandler(data) {
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return;
    }

    if (availableData.length >= 4) {
      this.dataVer = availableData.readInt32BE(0);
      console.log(`read tcp data version: ${this.dataVer}`);
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

  private cmdHandler(data) {
    let availableData = BufferUtil.mergeBuffers(this.remainderData, data);
    if (availableData == null) {
      console.log('no available data to parse');
      return;
    }

    if (availableData.length >= 4) {
      this.cmd = availableData.readInt32BE(0);
      console.log(`read tcp cmd: ${this.cmd}`);
      this.stateIndex += 1;
      if (availableData.length == 4) {
        this.remainderData = null;
      } else {
        this.remainderData = availableData.slice(4);
      }
      this.dispatchCmd(this.cmd, this.remainderData);
      // clear remainderData reference
      this.remainderData = null;
    } else {
      this.remainderData = availableData;
    }
  }

  private dispatchCmd(cmd, data) {
    console.log(`dispach cmd: ${cmd}`);
    switch(cmd) {
      case config.cmd.phone.cmd_send_file:
        this.innerHandler = new CmdSendFile(this.dataVer);
        this.innerHandler.handle(data);
        break;
      default:
        console.log(`unknown cmd to dispatch cmd: ${cmd}`);
    }
  }

}
