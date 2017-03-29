export const ASYNC_MSG = 'asynchronous-message';
export const SYNC_MSG = 'synchronous-message';

export class Message {
  name: string;
  obj: any;

  constructor(_name: string) {
    this.name = _name;
  }
}