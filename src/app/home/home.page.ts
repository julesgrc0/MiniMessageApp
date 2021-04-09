import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HomeModalPage } from '../home-modal/home-modal.page';
import { ToastController } from '@ionic/angular';
import { SettingsComponent } from '../settings/settings.component';
import { ServerServiceComponent } from '../server-service/server-service.component';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
export interface Message {
  username: string;
  userId: string;
  MessageContent: string;
  isMe: boolean;
  color: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          height: '200px',
          zIndex: 100
        })
      ),
      state(
        'closed',
        style({
          height: '80px',
          zIndex:-1
        })
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.3s')]),
    ]),
  ],
  providers: [Keyboard],
})


export class HomePage implements OnInit, AfterViewChecked {
  public GiftViewActive = false;
  public ShowSelfTag = true;
  public ShowUserTag = true;
  private showToast = true;

  public messages: Message[] = [];
  public MessageValue: string = '';
  public ActiveUser = { username: '', userId: '', color: 'rgb(208, 43, 230)' };

  public activeRoom: number = 0;
  public loading = true;
  public HaveClose = false;

  public HaveUpdate = false;
  public UpdateVersion: string = "";

  @ViewChild('messageElement') messageElement;

  @ViewChild('scrollBar') private scrollBar: ElementRef;

  constructor(
    public modalController: ModalController,
    private settings: SettingsComponent,
    private server: ServerServiceComponent,
    private toast: ToastController,
    private keyboard: Keyboard
  ) {}

  ngOnInit(): void {
    this.server.hasUpdate().then(info=>{ 
      if(info)
      {
        this.UpdateVersion = info;
        this.HaveUpdate = true;
      }
    })
    let options = this.settings.getSettings();
    this.setupOptions(options);
    this.activeRoom =
      options.defaultRoom != undefined ? options.defaultRoom : 0;

    this.server.getUser().then((user) => {
      this.ActiveUser = user;
      this.ActiveUser.username =
        options.userName != undefined ? options.userName : 'default';
      this.server.setName(this.ActiveUser.username);
      this.roomListenners();
      this.loading = false;
    });
  }

  roomListenners() {    
    this.server.getSocket().on(this.activeRoom + ':close', (data) => {
      this.messages = [];
      this.activeRoom = data.room;
      this.HaveClose = true;
    });

    this.server.getSocket().on(this.activeRoom + ':message', (data) => {
      if (data.room === this.activeRoom) {
        let message: Message = {
          username: data.username,
          userId: data.id,
          MessageContent: data.message,
          color: data.color,
          isMe: this.ActiveUser.userId == data.id ? true : false,
        };
        this.messages.push(message);
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollBar.nativeElement.scrollTop = this.scrollBar.nativeElement.scrollHeight;
    } catch (err) {}
  }

  setupOptions(options: any): void {
    this.ShowSelfTag =
      options.showSelfTag != undefined ? options.showSelfTag : true;
    this.ShowUserTag =
      options.showUsersTag != undefined ? options.showUsersTag : true;
    this.showToast = options.showToast != undefined ? options.showToast : true;
  }

  async presentToast() {
    const toast = await this.toast.create({
      message: 'Vos paramètres ont été enregistrés.',
      duration: 2000,
      position: 'top',
      animated: true,
      color: 'tertiary',
      translucent: true,
      buttons: [
        {
          side: 'end',
          icon: 'checkmark-outline',
          role: 'cancel',
          handler: () => {
            this.toast.dismiss();
          },
        },
      ],
    });
    toast.present();
  }

  async onMenuClick() {
    const modal = await this.modalController.create({
      component: HomeModalPage,
      componentProps: {
        username: this.ActiveUser.username,
        color: this.ActiveUser.color,
        room: this.activeRoom,
        options: this.settings.getSettings(),
        socket: this.server.getSocket(),
      },
    });

    await modal.present();

    modal.onDidDismiss().then((data) => {
      let value = data.data;
      let hasChange = false;

      if (value.username != this.ActiveUser.username) {
        this.server.setName(value.username);
        hasChange = true;
      }

      if (value.color != this.ActiveUser.color) {
        this.server.setColor(value.color);
        hasChange = true;
      }
      
      if (this.HaveClose || value.room.toString() != this.activeRoom.toString()) {
        if(this.HaveClose)
        {
          this.HaveClose = false;
        }
        this.messages = [];
        hasChange = true;

        this.server.getSocket().off(this.activeRoom + ':message');
        this.server.getSocket().off(this.activeRoom + ':close');
        this.activeRoom = value.room;
        this.roomListenners();
      }

      let tempSettings = this.settings.getSettings();
      if (value.options != tempSettings) {
        Object.keys(value.options).map((keyT) => {
          Object.keys(tempSettings).map((keyV) => {
            if (keyT == keyV && value.options[keyT] != tempSettings[keyV]) {
              hasChange = true;
            }
          });
        });
        value.options.userName = this.ActiveUser.username;
        this.settings.setSettings(value.options);
        this.setupOptions(value.options);
      }

      if (hasChange && this.showToast) {
        this.presentToast();
      }
    });
  }

  tagUser(userName: string, userId: string) {
    this.messageElement.setFocus();
    this.MessageValue += ' @' + userName + ' ';
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key == 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage(keep = false) {
    if (keep) {
      this.messageElement.setFocus();
    }
    if(this.MessageValue != '') 
    {
      this.server.sendMessage(this.activeRoom, this.MessageValue);
      this.MessageValue = '';
    }
    
  }

  onMessageBoxToggle(e) {}

  toggleGiftView() {
    this.GiftViewActive = !this.GiftViewActive;
  }
}