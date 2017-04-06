export const ASYNC_MSG = 'asynchronous-message';
export const SYNC_MSG = 'synchronous-message';

// renderer -> main
export const MSG_SHARE_FILES = 'share-files';
export const MSG_PHONE_LIST = 'phone-list';
export const MSG_LOCAL_PHONE_LIST = 'local-phone-list';

// main -> renderer
export const MSG_PHONE_LIST_REPLY = 'phone-list-reply';
export const MSG_LOCAL_PHONE_LIST_REPLY = 'local-phone-list-reply';

export class Message {
  name: string;
  obj: any;

  constructor(_name: string) {
    this.name = _name;
  }
}