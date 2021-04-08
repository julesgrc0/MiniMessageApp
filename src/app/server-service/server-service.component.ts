import { Component } from '@angular/core';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-server-service',
  templateUrl: './server-service.component.html',
  styleUrls: ['./server-service.component.scss'],
})
export class ServerServiceComponent {
  private ServerURL: string = 'https://send-server-api.herokuapp.com/';
  private socket: any;
  private User = { username: '', userId: '', color: '' };

  constructor() {
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
