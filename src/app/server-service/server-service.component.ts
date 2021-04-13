import { Component } from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-server-service',
  templateUrl: './server-service.component.html',
  styleUrls: ['./server-service.component.scss'],
})
export class ServerServiceComponent {

  private APP_VERSION: string = "7.0.1";
  private ServerURL: string = 'https://send-server-api.herokuapp.com/';
  
  private socket: any;
  private User = { username: '', userId: '', color: '' };

  constructor(private http: HttpClient) 
  {
    this.socket = io(this.ServerURL);
  }

  getSocket() {
    return this.socket;
  }

  getUser() {
    return new Promise<any>((resolve, reject) => {
      this.socket.on('user', (data: any) => {
        this.User.userId = data.id;
        this.User.username = data.username;
        this.User.color = data.color;
        resolve(this.User);
      });
    });
  }

  RoomExists(roomName): Promise<boolean> 
  {
    return new Promise<boolean>((resolve, reject) => 
    {
      this.socket.emit('room:exists',roomName);
      this.socket.off('exists')
      this.socket.on('exists',(res:boolean) =>{
        resolve(res);
      })
    })
  }

  getImage(url)
  {
    return new Promise<any>((resolve, reject) => {
      this.http.get(url).toPromise().then((response:any)=>{
        if(response)
        {
          if(!response.error)
          {
            resolve(response.value);
          }else{
            resolve(false)
          }
        }else{
          resolve(false)
        }
      })
    })
  }

  sendImage(token,image): Promise<any> 
  {
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(this.ServerURL+"image",{image:image,token:token}).toPromise().then((data)=>{
        resolve(data);
      }).catch(err=>resolve(err));
    })
  }

  hasUpdate(): Promise<any> 
  {
    return new Promise((res,rej)=>{
      this.http.get(this.ServerURL+"update").toPromise().then((data:any)=>{
        if(data.error || data.message.length == 0) 
        {
          res(false);
        }else
        {
         if(data.message[data.message.length-1].version != this.APP_VERSION)
         {
           res(data.message[data.message.length-1].version);
         }
        }
      }).catch(err=>res(false));
    })
  }

  setName(username: string) {
    this.socket.emit('set:username', username);
    this.User.username = username;
  }

  setColor(color: string) {
    this.socket.emit('set:color', color);
    this.User.color = color;
  }

  sendMessage(room: number, Message: string) {
    this.socket.emit('user:message', {
      room: room,
      username: this.User.username,
      id: this.User.userId,
      message: Message,
      color: this.User.color,
    });
  }
}
