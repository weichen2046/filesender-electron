import { Component } from '@angular/core';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-pc-list',
  templateUrl: './pc-list.component.html',
  styleUrls: [ './pc-list.component.scss' ]
})
export class PCListComponent {
  constructor() {
    console.log('sync msg from main process', ipcRenderer.sendSync('synchronous-message', 'ping'));
    ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log('async msg from main process', arg) // prints "pong"
    })
    ipcRenderer.send('asynchronous-message', 'ping')
  }
}