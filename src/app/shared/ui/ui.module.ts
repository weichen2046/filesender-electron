import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '@angular/material';

// bottomstatusbar
import { BottomStatusBarComponent } from './bottomstatusbar/index';

// contentview
import { ContentViewComponent } from './contentview/index';

// tabview
import { TabViewComponent } from './tabview/index';
import { TabBarComponent } from './tabview/index';
import { TabContentComponent } from './tabview/index';
import { TabBarItemComponent } from './tabview/index';

// tabview pages
import { PCListComponent } from './pc-list/index';

// toolsbar
import { ToolsBarComponent } from './toolsbar/index';
import { ToolsBarItemComponent } from './toolsbar/index';

@NgModule({
  declarations: [
    BottomStatusBarComponent,
    ContentViewComponent,
    TabViewComponent,
    TabBarComponent,
    TabBarItemComponent,
    TabContentComponent,
    ToolsBarComponent,
    ToolsBarItemComponent,
    PCListComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
  ],
  providers: [],
  exports: [
    BottomStatusBarComponent,
    ContentViewComponent,
    TabViewComponent,
    ToolsBarComponent
  ],
  entryComponents: [
    PCListComponent,
  ],
})
export class UiModule { }
