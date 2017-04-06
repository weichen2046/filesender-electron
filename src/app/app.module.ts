import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';

import { AppComponent } from './app.component';
import { Environment } from './environment.service';

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
    Environment
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
