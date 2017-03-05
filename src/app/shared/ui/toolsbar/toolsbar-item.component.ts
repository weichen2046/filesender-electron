import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toolsbar-item',
  templateUrl: './toolsbar-item.component.html',
  styleUrls: [ './toolsbar-item.component.scss' ]
})
export class ToolsBarItemComponent {
  private _type: string = 'button';
  private _text: string = '';
  private _clickHanler: any;

  @Input()
  set itemtype(type: string) {
    this._type = type;
  }
  get itemtype(): string {
    return this._type;
  }

  @Input()
  set itemtext(text: string) {
    this._text = text;
  }
  get itemtext(): string {
    return this._text;
  }

  set clickhandler(handler: any) {
    this._clickHanler = handler;
  }

  public onClick() {
    if (this._clickHanler) {
        this._clickHanler();
    }
  }

}