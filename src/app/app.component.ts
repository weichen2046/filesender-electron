import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

import { remote } from 'electron';

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
    newW.loadURL('https://www.google.com.hk');
    newW.show();
  }
}
