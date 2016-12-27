import { NgModule } from '@angular/core';

import { TabViewComponent } from './tabview/index';
import { TabsBarComponent } from './tabview/index';
import { TabContentComponent } from './tabview/index';

@NgModule({
  declarations: [
    TabViewComponent,
    TabsBarComponent,
    TabContentComponent
  ],
  imports: [],
  providers: [],
  exports: [
    TabViewComponent
  ]
})
export class UiModule { }
