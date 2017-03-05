import { Component, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'contentview',
  templateUrl: './contentview.component.html',
  styleUrls: [ './contentview.component.scss' ]
})
export class ContentViewComponent {
  @ViewChild('middletemplate', {read: ViewContainerRef}) middleRef: ViewContainerRef;

  private _showLeft: boolean = false;
  private _showRight: boolean = false;
  private _showMiddle: boolean = true;

  public showLeft(show: boolean) {
    this._showLeft = show;
  }

  get isleftshow(): boolean {
    return this._showLeft;
  }

  get isrightshow(): boolean {
    return this._showRight;
  }

  get ismiddleshow(): boolean {
    return this._showMiddle;
  }
}
