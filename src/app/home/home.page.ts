import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { HomeModalPage } from '../home-modal/home-modal.page';
import { ToastController } from '@ionic/angular';
import { SettingsComponent } from '../settings/settings.component';
import { ServerServiceComponent } from '../server-service/server-service.component';
import { ModalRoomPage } from '../modal-room/modal-room.page';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogGiftComponent,
  GiftDialogData,
  GiftType,
} from '../dialog-gift/dialog-gift.component';
import {DomSanitizer} from '@angular/platform-browser';

export interface Message {
  username: string;
  userId: string;
  MessageContent: string;
  isMe: boolean;
  color: string;
  isImage: boolean;
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
          zIndex: 100,
        })
      ),
      state(
        'closed',
        style({
          height: '80px',
          zIndex: -1,
        })
      ),
      transition('open => closed', [animate('0.3s')]),
      transition('closed => open', [animate('0.3s')]),
    ]),
  ],
  providers: [],
})
export class HomePage implements OnInit, AfterViewChecked {
  public GiftViewActive = false;
  public ShowSelfTag = true;
  public ShowUserTag = true;
  private showToast = true;
  public showCloseToast = true;

  public messages: Message[] = [];
  public MessageValue: string = '';
  public ActiveUser = { username: '', userId: '', color: 'rgb(208, 43, 230)' };

  public activeRoom: number = 0;
  public loading = true;
  public HaveClose = false;

  public HaveUpdate = false;
  public UpdateVersion: string = '';

  @ViewChild('messageElement') messageElement;

  @ViewChild('scrollBar') private scrollBar: ElementRef;

  constructor(
    public modalController: ModalController,
    private mdCtrl: ModalController,
    private settings: SettingsComponent,
    private server: ServerServiceComponent,
    private toast: ToastController,
    public platform: Platform,
    public dialog: MatDialog,
    public sanitizer: DomSanitizer,
  ) {
    this.platform.ready().then((value) => {
      this.loading = true;
      this.platform.pause.subscribe(() => {
        if (this.activeRoom != 0) {
          this.server.RoomExists(this.activeRoom).then((ok) => {
            if (ok) {
              this.roomRemove();
              this.roomListenners();
            } else {
              this.presentToast('Cette Room a été fermer.');
              this.messages = [];
              this.roomRemove();
              this.activeRoom = 0;
              this.roomListenners();
              this.server.getSocket().emit('room:kill', '');
            }
            this.loading = false;
          });
        } else {
          this.roomRemove();
          this.activeRoom = 0;
          this.roomListenners();
          this.loading = false;
        }
      });
    });
  }

  checkUpdate() {
    this.HaveUpdate = false;
    this.server.hasUpdate().then((info) => {
      if (info) {
        this.UpdateVersion = info;
        this.HaveUpdate = true;
      }
    });
  }

  ngOnInit(): void {
    this.platform.backButton.subscribeWithPriority(9999, () => {
      document.addEventListener(
        'backbutton',
        (event) => {
          event.preventDefault();
          event.stopPropagation();
        },
        false
      );
    });

    this.checkUpdate();

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
      if(this.showCloseToast)
      {
        this.presentToast('Cette Room a été fermer.');
      }
      
    });

    this.server.getSocket().on(this.activeRoom + ':message', (data) => {
      if (data.room === this.activeRoom) {
        let message: Message = {
          username: data.username,
          userId: data.id,
          MessageContent: data.message,
          color: data.color,
          isMe: this.ActiveUser.userId == data.id ? true : false,
          isImage:false
        };
        this.messages.push(message);
      }
    });

    this.server.getSocket().on(this.activeRoom + ':image', (data) => {
      if (data.room === this.activeRoom) {
        let message: Message = {
          username: data.username,
          userId: data.id,
          MessageContent: data.message,
          color: data.color,
          isMe: this.ActiveUser.userId == data.id ? true : false,
          isImage:true
        };

        this.messages.push(message);
      }
    });
  }

  openGiftDialog(type: string) {
    this.GiftViewActive = false;
    let giftType: GiftType = GiftType.IMAGE;
    switch (type) {
      case 'IMAGE':
        giftType = GiftType.IMAGE;
        break;
      case 'BATTERY':
        giftType = GiftType.BATTERY;
        break;
      case 'IDEA':
        giftType = GiftType.IDEA;
        break;
      case 'CODE':
        giftType = GiftType.CODE;
        break;
      case 'PHONE':
        giftType = GiftType.PHONE;
        break;
      case 'GAME':
        giftType = GiftType.GAME;
        break;
      case 'HIDDEN':
        giftType = GiftType.HIDDEN;
        break;
      case 'QUESTION':
        giftType = GiftType.QUESTION;
        break;
      case 'LOCATION':
        giftType = GiftType.LOCATION;
        break;
      case 'INFO':
        giftType = GiftType.INFO;
        break;
      case 'LOVE':
        giftType = GiftType.LOVE;
        break;
      case 'QR_CODE':
        giftType = GiftType.QR_CODE;
        break;
    }

    const dialogRef = this.dialog.open(DialogGiftComponent, {
      data: {
        type: giftType,
        username: this.ActiveUser.username,
        color: this.ActiveUser.color,
        room: this.activeRoom,
      },
      id: 'giftDialog',
    });

    dialogRef.afterClosed().subscribe((data: GiftDialogData | undefined) => {
      if (data != undefined) 
      {
        this.server.getSocket().emit('user:image',{
          room: this.activeRoom,
          username: this.ActiveUser.username,
          id: this.ActiveUser.userId,
          message: data.outputMessage,
          color: this.ActiveUser.color,
        });
      }
    });
  }

  roomRemove() {
    this.server.getSocket().off(this.activeRoom + ':message');
    this.server.getSocket().off(this.activeRoom + ':close');
    this.server.getSocket().off(this.activeRoom + ':image');
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
    this.showCloseToast = options.showCloseToast != undefined ? options.showCloseToast : true;
  }

  async presentToast(message) {
    const toast = await this.toast.create({
      message: message,
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

  async onRoomClick() {
    const modal = await this.mdCtrl.create({
      component: ModalRoomPage,
      componentProps: {
        room: this.activeRoom,
        socket: this.server.getSocket(),
        username: this.ActiveUser.username,
      },
    });

    await modal.present();

    modal.onDidDismiss().then((data) => {
      if (data.data.room != this.activeRoom) {
        this.messages = [];
        this.roomRemove();
        this.activeRoom = data.data.room;
        this.roomListenners();
      }
    });
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

      if (
        this.HaveClose ||
        value.room.toString() != this.activeRoom.toString()
      ) {
        if (this.HaveClose) {
          this.HaveClose = false;
        }

        hasChange = true;

        this.messages = [];
        this.roomRemove();
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
        this.presentToast('Vos paramètres ont été enregistrés.');
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
    if (this.MessageValue != '') {
      if (
        !this.server.getSocket().hasListeners(this.activeRoom + ':message') ||
        !this.server.getSocket().hasListeners(this.activeRoom + ':close')
      ) {
        this.roomRemove();
        this.roomListenners();
      }

      this.server.sendMessage(this.activeRoom, this.MessageValue);
      this.MessageValue = '';
    }
  }

  onMessageBoxToggle(e) {}

  toggleGiftView() {
    this.GiftViewActive = !this.GiftViewActive;
  }
}
