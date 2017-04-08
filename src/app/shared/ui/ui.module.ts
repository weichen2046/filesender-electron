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

// toolsbar
import { ToolsBarComponent } from './toolsbar/index';
import { ToolsBarItemComponent } from './toolsbar/index';

// tabview pages
import { PhoneListComponent } from './phone-list/index';
import { PhoneDetailsComponent } from "app/shared/ui/phone-details";
import { PhoneCmdResultComponent } from "app/shared/ui/phone-cmd-result";

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
    PhoneListComponent,
    PhoneDetailsComponent,
    PhoneCmdResultComponent,
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
    PhoneListComponent,
    PhoneDetailsComponent,
    PhoneCmdResultComponent,
  ],
})
export class UiModule { }
