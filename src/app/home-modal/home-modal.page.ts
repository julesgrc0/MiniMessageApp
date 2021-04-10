import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-home-modal',
  templateUrl: './home-modal.page.html',
  styleUrls: ['./home-modal.page.scss'],
})
export class HomeModalPage implements OnInit {
  @Input() username: string;
  @Input() color: string;
  @Input() room: number = 0;
  @Input() options: any;
  @Input() socket: any;
  public rooms: any;

  public colors: string[] = [
    '#13233B',
    '#18627F',
    '#23AEC7',
    '#6AC99B',
    '#C4EE75',
    '#E84371',
    '#938B78',
    '#6EB7BE',
    '#0B79A8',
    '#D22728',
    '#F7C572',
    '#ADCC4B',
    '#FE9F26',
  ];

  constructor(
    private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {}

  setColor(color: string): void {
    this.color = color;
  }

  onChangeUsername() {
    this.username = this.username.replace(/\s/g, '_');
    this.username = this.username.replace(/\-/g, '.');
    this.username = this.username.match(/[a-zA-Z0-9\.\s]+/g).join('_');
    this.username = this.username.toLocaleLowerCase();
    this.username = this.username.slice(0,30);
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismiss: true,
      options: this.options,
      username: this.username,
      color: this.color,
      room: this.room,
    });
  }

 
}
