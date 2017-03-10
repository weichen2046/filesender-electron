import { ipcMain } from 'electron';

export class MessageCenter {
  public init() {
    ipcMain.on('asynchronous-message', (event, arg) => {
      console.log('async msg from renderer process', arg)  // prints "ping"
      event.sender.send('asynchronous-reply', 'pong')
    })
    ipcMain.on('synchronous-message', (event, arg) => {
      console.log('sync msg from renderer process', arg)  // prints "ping"
      event.returnValue = 'pong'
    })
  }

  public destroy() {
    ipcMain.removeAllListeners('asynchronous-message');
    ipcMain.removeAllListeners('synchronous-message');
  }
}