import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalController } from '@ionic/angular';
import { DialogRoomComponent } from '../dialog-room/dialog-room.component';

export interface DialogData {
  roomName: string;
}

@Component({
  selector: 'app-modal-room',
  templateUrl: './modal-room.page.html',
  styleUrls: ['./modal-room.page.scss'],
})
export class ModalRoomPage implements OnInit {
  @Input() room: string;
  @Input() socket;
  @Input() username;

  public rooms: any[] = [];
  public search;
  public searchRooms: any[] = [];
  public loading = false;
  public isOpen = false;

  constructor(private modalCtrl: ModalController,public dialog: MatDialog) {}

  ngOnInit() {
    this.socket.emit('room:list', '');
    this.socket.on('rooms', (rooms) => {
      this.rooms = rooms;
      this.searchRooms = this.rooms;
    });
  }

  onSearch() {
    let res = this.searchStringInArray(this.search, this.rooms);
    this.searchRooms = res;
  }

  searchStringInArray(str, array:string[]) 
  {
    let res = []
    array.map((item:any)=>{
      if(str == item.room.toString() || item.creator.username.toLocaleLowerCase().includes(str)  || str.toLocaleLowerCase().includes(item.creator.username)) 
      {
        res.push(item);
      }
    });

    if(res.length == 0)
    {
      res = this.rooms;
    }
    
    return res;
  }

  createRoom(roomname) 
  {
    this.socket.emit('room:kill', '');
    this.socket.emit('room:code', roomname);
    this.socket.on('code', (index) => {
      this.room = index.room;
      this.socket.emit('set:username',this.username);
      this.loading = false;
      this.dismiss();
    });
  }

  openRoomDialog()
  {
    this.isOpen = true;
    const dialogRef = this.dialog.open(DialogRoomComponent, {
      height: '170px',
      data: {roomName: this.username},
      id: 'roomDialog'
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data != undefined && data.roomName != undefined) 
      {
        this.loading = true;
       this.createRoom(data.roomName);
      }
      this.isOpen = false;
    });
  } 

  onRoomClick(index) {    
    if(this.room != index)
    {
      this.socket.emit('room:kill', '');
      this.room = index;
    }
    this.dismiss();
  }

  dismiss() 
  {
    this.modalCtrl.dismiss({
      dismiss: true,
      room: this.room,
    });
  }
}
