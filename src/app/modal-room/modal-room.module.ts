import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalRoomPageRoutingModule } from './modal-room-routing.module';

import { ModalRoomPage } from './modal-room.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalRoomPageRoutingModule
  ],
  declarations: [ModalRoomPage]
})
export class ModalRoomPageModule {}
