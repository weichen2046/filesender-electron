import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

//impprt { remote } from 'electron';
//const remote = require('electron').remote;
const { remote } = require('electron');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit() {
  }

  public newWindow() {
    let newW = new remote.BrowserWindow({
      width: 800,
      height: 600
    });

    newW.on('close', () => newW = null);
    newW.loadURL('file://' + remote.app.getAppPath() + '/dist/index.html');
    newW.show();
  }
}
