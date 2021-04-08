import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeModalPage } from './home-modal.page';

const routes: Routes = [
  {
    path: '',
    component: HomeModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeModalPageRoutingModule {}
