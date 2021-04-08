import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-room',
  templateUrl: './modal-room.page.html',
  styleUrls: ['./modal-room.page.scss'],
})
export class ModalRoomPage implements OnInit {
  @Input() room: string;
  @Input() socket;
  public rooms: any[] = [];
  public search;
  public searchRooms: any[] = [];

  constructor(private modalCtrl: ModalController) {}

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
    console.log(res);
    if(res.length == 0)
    {
      res = this.rooms;
    }
    
    return res;
  }

  onRoomClick(index) {    
    if(this.room != index)
    {
      this.socket.emit('room:kill', '');
      this.room = index;
    }
    this.dismiss();
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismiss: true,
      room: this.room,
    });
  }
}
