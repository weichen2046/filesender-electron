import { Component, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { OnInit } from '@angular/core';

import { EnvironConfigService } from './environ-config.service';

import { ToolsBarComponent } from './shared/index';

//impprt { remote } from 'electron';
//const remote = require('electron').remote;
const { remote } = require('electron');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild(ToolsBarComponent) toolsbar: ToolsBarComponent;

  constructor(private envConfig: EnvironConfigService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  /*
  public newWindow() {
    let newW = new remote.BrowserWindow({
      width: 800,
      height: 600
    });

    newW.on('close', () => newW = null);
    newW.loadURL('file://' + remote.app.getAppPath() + '/dist/index.html');
    newW.show();
  }
  */
}
