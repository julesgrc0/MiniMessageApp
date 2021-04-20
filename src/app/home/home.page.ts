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
import {
  DialogGiftComponent,
  GiftDialogData,
  GiftType,
} from '../dialog-gift/dialog-gift.component';
import { Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { HomeModalPage } from '../home-modal/home-modal.page';
import { ToastController } from '@ionic/angular';
import { SettingsComponent } from '../settings/settings.component';
import { ServerServiceComponent } from '../server-service/server-service.component';
import { ModalRoomPage } from '../modal-room/modal-room.page';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';
import { exit } from 'process';
export interface Message {
  username: string;
  userId: string;
  MessageContent: any;
  isMe: boolean;
  color: string;
  isImage: boolean;
  isInfoMessage: boolean;
  isReconnectionMessage: boolean;
  isQuestionMessage: boolean;
  pressValue?: number;
  Id?: string;
  haveSelect?: boolean;
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
  encapsulation: ViewEncapsulation.None,
  providers: [],
})
export class HomePage implements OnInit, AfterViewChecked {
  public showToast = true;
  public ShowSelfTag = true;
  public ShowUserTag = true;
  public showCloseToast = true;
  public showNewUser = true;
  public loading = true;

  public GiftViewActive = false;
  public HaveClose = false;
  public HaveUpdate = false;
  public popUpActiveRoom = false;
  public noResumImage = false;
  public CommandCompletionActive = false;

  public messages: Message[] = [];
  public commands: string[] = [
    '/remove @user',
    '/alert @user',
    '/close',
    '/exit',
    '/ping',
    '/update',
    '/home',
    '/rooms',
    '/settings',
    '/gift',
  ];
  public viewCommands: string[] = [];

  public ActiveUser = { username: '', userId: '', color: 'rgb(208, 43, 230)' };
  public messagePress = { active: false, id: undefined };

  public activeRoom: number = 0;
  public MessageValue: string = '';
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
    public sanitizer: DomSanitizer
  ) {
    this.platform.ready().then((value) => {
      this.platform.resume.subscribe(() => {
        if (!this.noResumImage) {
          this.presentToast('Reconnection a la Room...', 1000, 'globe-outline');
          this.loading = true;

          this.server.RoomExists(this.activeRoom).then((ok) => {
            if (!ok) {
              this.messages = [];
              this.presentToast('La Room a été fermer');
              this.roomRemove();
              this.activeRoom = 0;
              this.roomListenners();
              this.server.getSocket().emit('room:kill', '');
            } else {
              let recMsg: Message = {
                username: '',
                userId: '',
                MessageContent: 'Reconnection a la Room',
                isMe: false,
                color: '',
                isImage: false,
                isInfoMessage: false,
                isReconnectionMessage: true,
                isQuestionMessage: false,
              };
              this.messages.push(recMsg);
              this.scrollToBottom();
            }
            this.loading = false;
          });
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
    this.server.getSocket().on(this.activeRoom + ':leave', (newUser) => {
      if (this.showNewUser) {
        let newUserinfo: Message = {
          username: newUser.username,
          userId: newUser.id,
          MessageContent: newUser.message,
          isMe: false,
          color: '#dcdcdc',
          isImage: false,
          isInfoMessage: true,
          isReconnectionMessage: false,
          isQuestionMessage: false,
        };
        this.messages.push(newUserinfo);

        if (!this.messagePress.active) {
          this.scrollToBottom();
        }
      }
    });

    this.server.getSocket().on(this.activeRoom + ':join', (newUser) => {
      if (this.showNewUser) {
        let newUserinfo: Message = {
          username: newUser.username,
          userId: newUser.id,
          MessageContent: newUser.message,
          isMe: false,
          color: '#dcdcdc',
          isImage: false,
          isInfoMessage: true,
          isReconnectionMessage: false,
          isQuestionMessage: false,
        };
        this.messages.push(newUserinfo);
        if (!this.messagePress.active) {
          this.scrollToBottom();
        }
      }
    });

    this.server.getSocket().on(this.activeRoom + ':close', (data) => {
      this.messages = [];
      this.activeRoom = data.room;
      this.HaveClose = true;
      if (this.showCloseToast) {
        this.presentToast('La Room a été fermer');
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
          isImage: false,
          isInfoMessage: false,
          isReconnectionMessage: false,
          isQuestionMessage: false,
        };
        this.messages.push(message);
        if (!this.messagePress.active) {
          this.scrollToBottom();
        }
        if (this.messages.length > 100) {
          this.messages = this.messages.slice(0, 50);
        }
      }
    });

    this.server.getSocket().on(this.activeRoom + ':image', (data) => {
      if (data.room === this.activeRoom) {
        this.server.getImage(data.message).then((image) => {
          if (image) {
            let message: Message = {
              username: data.username,
              userId: data.id,
              MessageContent: image,
              color: data.color,
              isMe: this.ActiveUser.userId == data.id ? true : false,
              isImage: true,
              isInfoMessage: false,
              isReconnectionMessage: false,
              isQuestionMessage: false,
            };

            this.messages.push(message);
            if (!this.messagePress.active) {
              this.scrollToBottom();
            }
            if (this.messages.length > 100) {
              this.messages = this.messages.slice(0, 50);
            }
          }
        });
      }
    });

    this.server.getSocket().on(this.activeRoom + ':question', (data) => {
      if (data.room === this.activeRoom) {
        let message: Message = {
          username: data.username,
          userId: data.userId,
          MessageContent: data,
          color: data.color,
          isMe: this.ActiveUser.userId == data.userId ? true : false,
          isImage: false,
          isInfoMessage: false,
          isReconnectionMessage: false,
          isQuestionMessage: true,
          Id: data.id,
          haveSelect: false,
        };
        this.messages.push(message);
        if (!this.messagePress.active) {
          this.scrollToBottom();
        }
      }
    });

    this.server.getSocket().on(this.activeRoom + ':question:update', (data) => {
      let i = 0;
      this.messages.map((msg) => {
        if (msg.Id) {
          if (msg.Id == data.id) {
            this.messages[i].MessageContent.v1 = data.vote_1;
            this.messages[i].MessageContent.v2 = data.vote_2;
          }
        }
        i++;
      });
    });

    this.server.getSocket().on('pong',(ping)=>{
      let recMsg: Message = {
        username: '',
        userId: '',
        MessageContent: 'Ping '+ping+'ms',
        isMe: false,
        color: '',
        isImage: false,
        isInfoMessage: false,
        isReconnectionMessage: true,
        isQuestionMessage: false,
      };
      this.messages.push(recMsg);
      this.scrollToBottom();
    })
  }

  clickQuestion(messageIndex, isYes) {
    let msg = this.messages[messageIndex];
    if (msg.Id && !msg.haveSelect) {
      this.server.getSocket().emit('user:question:update', {
        room: this.activeRoom,
        vote: isYes,
        questionID: msg.Id,
      });
      this.messages[messageIndex].haveSelect = true;
    }
  }

  openGiftDialog(type: string) {
    this.popUpActiveRoom = true;
    this.GiftViewActive = false;
    let giftType: GiftType = GiftType.IMAGE;
    let width = '60%';

    switch (type) {
      case 'IMAGE':
        giftType = GiftType.IMAGE;
        break;
      case 'BATTERY':
        giftType = GiftType.BATTERY;
        break;
      case 'IDEA':
        giftType = GiftType.IDEA;
        width = '80%';
        break;
      case 'CODE':
        giftType = GiftType.CODE;
        width = '80%';
        break;
      case 'PHONE':
        giftType = GiftType.PHONE;
        width = '65%';
        break;
      case 'GAME':
        width = '80%';
        giftType = GiftType.GAME;
        break;
      case 'HIDDEN':
        width = '80%';
        giftType = GiftType.HIDDEN;
        break;
      case 'QUESTION':
        width = '80%';
        giftType = GiftType.QUESTION;
        break;
      case 'LOCATION':
        width = '70%';
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

    if (giftType === GiftType.IMAGE || giftType === GiftType.LOCATION) {
      this.noResumImage = true;
    }

    const dialogRef = this.dialog.open(DialogGiftComponent, {
      width: width,
      data: {
        type: giftType,
        username: this.ActiveUser.username,
        color: this.ActiveUser.color,
        room: this.activeRoom,
      },
      id: 'giftDialog',
    });

    dialogRef.afterClosed().subscribe((data: GiftDialogData | undefined) => {
      if (this.noResumImage) {
        this.loading = true;
        this.server.RoomExists(this.activeRoom).then((ok) => {
          if (!ok) {
            this.messages = [];
            this.presentToast('La Room a été fermer');
            this.roomRemove();
            this.activeRoom = 0;
            this.roomListenners();
            this.server.getSocket().emit('room:kill', '');
          }
          this.loading = false;
        });
        this.noResumImage = false;
      }

      this.popUpActiveRoom = false;

      if (data != undefined) {
        if (data.type == GiftType.IMAGE) {
          this.server.getSocket().emit('user:image', { room: this.activeRoom });
          this.server.getSocket().on('user:token', (token) => {
            this.server.sendImage(token, data.outputMessage);
            this.server.getSocket().off('user:token');
          });
        } else if (
          data.type == GiftType.IDEA ||
          data.type == GiftType.CODE ||
          data.type == GiftType.GAME ||
          data.type == GiftType.PHONE ||
          data.type == GiftType.HIDDEN ||
          data.type == GiftType.BATTERY ||
          data.type == GiftType.LOCATION
        ) {
          this.server.sendMessage(this.activeRoom, data.outputMessage);
        } else if (data.type == GiftType.QUESTION) {
          this.server.getSocket().emit('user:question', {
            room: this.activeRoom,
            value: data.outputMessage,
          });
        }
      } else {
        this.GiftViewActive = true;
      }
    });
  }

  roomRemove() {
    this.server.getSocket().off(this.activeRoom + ':message');
    this.server.getSocket().off(this.activeRoom + ':close');
    this.server.getSocket().off(this.activeRoom + ':image');
    this.server.getSocket().off(this.activeRoom + ':join');
    this.server.getSocket().off(this.activeRoom + ':leave');
    this.server.getSocket().off(this.activeRoom + ':question');
    this.server.getSocket().off(this.activeRoom + ':question:update');
    this.server.getSocket().off('pong');
  }

  ngAfterViewChecked() {
    // if(!this.messagePress.active)
    // {
    //   this.scrollToBottom();
    // }
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
    this.showCloseToast =
      options.showCloseToast != undefined ? options.showCloseToast : true;
    this.showNewUser =
      options.showNewUser != undefined ? options.showNewUser : true;
  }

  async presentToast(message, duration = 2000, icon = 'checkmark-outline') {
    const toast = await this.toast.create({
      message: message,
      duration: duration,
      position: 'top',
      animated: true,
      color: 'tertiary',
      translucent: true,
      buttons: [
        {
          side: 'end',
          icon: icon,
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
        this.server.getSocket().emit('user:select', data.data.room);
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

  isValidCmd(value: string): boolean {
    for (let cmd of this.commands) {
      if (cmd.split(' ')[0] == value.split(' ')[0]) {
        return true;
      }
    }
    return false;
  }

  executeCommand() {
    if (this.CommandCompletionActive) {
      if (this.isValidCmd(this.MessageValue)) {
        let cmds = this.MessageValue.split(' ');
        let cmd = cmds[0];

        switch (cmd) {
          case '/remove':
            if (cmds.length == 2) {
              console.log('remove ', cmds[1]);
            }
            break;
          case '/alert':
            if (cmds.length == 2) {
              console.log('alert ', cmds[1]);
            }
            break;
          case '/close':
            this.server.getSocket().emit('room:kill', '');
            break;
          case '/exit':
            exit(0);
            break;
          case '/ping':
            this.server.getSocket().emit('ping', Date.now());
            break;
          case '/update':
            this.checkUpdate();
            break;
          case '/home':
            this.server.getSocket().emit('room:kill', '');
            this.messages = [];
            this.roomRemove();
            this.activeRoom = 0;
            this.roomListenners();
            this.server.getSocket().emit('user:select', 0);
            break;
          case '/rooms':
            this.onRoomClick();
            break;
          case '/settings':
            this.onMenuClick();
            break;
          case '/gift':
            this.GiftViewActive = true;
            break;
        }

        setTimeout(() => {
          this.viewCommands = [];
          this.CommandCompletionActive = false;
          this.MessageValue = '';
        }, 200);
      } else {
        // this.MessageValue = this.viewCommands[this.viewCommands.length - 1];
        this.sendMessage(true);
      }
    }
  }

  onMessageChange() {
    if (this.MessageValue.startsWith('/')) {
      this.CommandCompletionActive = true;
      this.viewCommands = [];
      for (const cmd of this.commands) {
        if (cmd.match(this.MessageValue)) {
          this.viewCommands.push(cmd);
        }
      }
    } else {
      this.CommandCompletionActive = false;
    }
  }

  toggleGiftView() {
    this.GiftViewActive = !this.GiftViewActive;
  }

  onMessageStartPress(messageIndex) {
    this.messagePress.active = true;
    this.messages[messageIndex].pressValue = 1;
    this.messagePress.id = setInterval(() => {
      if (this.messages[messageIndex].pressValue + 5 > 101) {
        this.messageElement.setFocus();
        this.MessageValue += this.messages[messageIndex].MessageContent;
        this.onMessageEndPress(messageIndex);
      } else {
        this.messages[messageIndex].pressValue += 5;
      }
    }, 100);
  }

  onMessageEndPress(messageIndex) {
    if (this.messagePress.active) {
      this.messages[messageIndex].pressValue = 0;
      this.messagePress.active = false;
      clearInterval(this.messagePress.id);
    }
  }
}
