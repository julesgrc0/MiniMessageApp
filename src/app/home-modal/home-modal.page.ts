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
  public loading = false;

  public colors: string[] = [
    '#2b2e4a',
    '#542e71',
    '#a799b7',
    '#e84545',
    '#fdca40',
  ];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.loading = true;
    let out = setTimeout(() => {
      this.loading = false;
      this.socket.off('username');
    }, 2000);
    this.socket.on('username', (name) => {
      clearTimeout(out);
      this.loading = false;
      this.username = name;
      this.socket.off('username');
    });
    this.socket.emit('set:username', this.username);
  }

  setColor(color: string): void {
    this.color = color;
  }

  onChangeUsername() {
    this.username = this.username?.replace(/\s/g, '_');
    this.username = this.username?.replace(/\-/g, '.');
    this.username = this.username?.match(/[a-zA-Z0-9\.\s]+/g)?.join('_');
    this.username = this.username?.toLocaleLowerCase();
    this.username = this.username?.slice(0, 30);
  }

  onEndUsername() {
    let out = setTimeout(() => {
      this.loading = false;
      this.socket.off('username');
    }, 2000);

    this.loading = true;
    this.socket.on('username', (name) => {
      clearTimeout(out);
      this.loading = false;
      this.username = name;
      this.socket.off('username');
    });
    this.socket.emit('set:username', this.username);
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
