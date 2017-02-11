import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';

import { AppComponent } from './app.component';
import { EnvironConfigService } from './environ-config.service';

import { UiModule } from './shared/index';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    UiModule,
    MaterialModule.forRoot(),
  ],
  providers: [
    EnvironConfigService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
