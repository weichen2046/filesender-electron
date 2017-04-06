import { Component, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { OnInit } from '@angular/core';

import { Environment } from './environment.service';

import { ToolsBarComponent } from './shared/index';
import { ContentViewComponent } from './shared/index';
import { BottomStatusBarComponent } from './shared/index';

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

  @ViewChild(ToolsBarComponent) _toolsbar: ToolsBarComponent;
  @ViewChild(ContentViewComponent) _contentview: ContentViewComponent;
  @ViewChild(BottomStatusBarComponent) _statusbar: BottomStatusBarComponent;

  constructor(private environment: Environment) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    //console.log('toolsbar.manager:', this._toolsbar.manager);
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
