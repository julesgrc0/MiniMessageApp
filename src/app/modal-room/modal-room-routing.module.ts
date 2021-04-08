import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalRoomPage } from './modal-room.page';

const routes: Routes = [
  {
    path: '',
    component: ModalRoomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalRoomPageRoutingModule {}
