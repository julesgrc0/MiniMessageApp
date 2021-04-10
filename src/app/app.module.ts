import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  IonicModule,
  IonicRouteStrategy,
  ModalController,
} from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { FormsModule } from '@angular/forms';
import { ServerServiceComponent } from './server-service/server-service.component';
import { CommonModule } from '@angular/common';
import { HomeModalPageModule } from './home-modal/home-modal.module';
import { ModalRoomPageModule } from './modal-room/modal-room.module';
import { HttpClientModule } from '@angular/common/http';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogRoomComponent } from './dialog-room/dialog-room.component';
@NgModule({
  declarations: [
    AppComponent,
    DialogRoomComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
    HomeModalPageModule,
    ModalRoomPageModule,
    HttpClientModule,
    MatDialogModule,
  ],
  providers: [
    { 
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    SettingsComponent,
    ServerServiceComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
