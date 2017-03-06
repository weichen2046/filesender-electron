import { Component, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'contentview',
  templateUrl: './contentview.component.html',
  styleUrls: [ './contentview.component.scss' ]
})
export class ContentViewComponent {
  @ViewChild('anchorLeft', {read: ViewContainerRef}) _childAnchorLeft: ViewContainerRef;
  @ViewChild('anchorMiddle', {read: ViewContainerRef}) _childAnchorMidd: ViewContainerRef;
  @ViewChild('anchorRight', {read: ViewContainerRef}) _childAnchorRight: ViewContainerRef;

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
