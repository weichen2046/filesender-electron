import { NgModule } from '@angular/core';
import { MaterialModule } from '@angular/material';

// bottomstatusbar
import { BottomStatusBarComponent } from './bottomstatusbar/index';

// contentview
import { ContentViewComponent } from './contentview/index';

// tabview
import { TabViewComponent } from './tabview/index';
import { TabsBarComponent } from './tabview/index';
import { TabContentComponent } from './tabview/index';

// toolsbar
import { ToolsBarComponent } from './toolsbar/index';

@NgModule({
  declarations: [
    BottomStatusBarComponent,
    ContentViewComponent,
    TabViewComponent,
    TabsBarComponent,
    TabContentComponent,
    ToolsBarComponent
  ],
  imports: [
    MaterialModule,
  ],
  providers: [],
  exports: [
    BottomStatusBarComponent,
    ContentViewComponent,
    TabViewComponent,
    ToolsBarComponent
  ]
})
export class UiModule { }
