import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ImagePicker,
  ImagePickerOptions,
} from '@ionic-native/image-picker/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { BatteryStatus } from '@ionic-native/battery-status/ngx';

export enum GiftType {
  IMAGE,
  BATTERY,
  IDEA,
  CODE,
  PHONE,
  GAME,
  HIDDEN,
  QUESTION,
  LOCATION,
  INFO,
  LOVE,
  QR_CODE,
}
export interface GiftDialogData {
  type: GiftType;
  outputMessage: string;
  username: string;
  color: string;
  room: number;
}

@Component({
  selector: 'app-dialog-gift',
  templateUrl: './dialog-gift.component.html',
  styleUrls: ['./dialog-gift.component.scss'],
  providers: [ImagePicker, Base64, BatteryStatus],
})
export class DialogGiftComponent implements OnInit {
  public isFinish = false;
  public textContent: string = '';
  public colorBattery = {
    a: 'rgb(48,48,48)',
    b: 'rgb(48,48,48)',
    c: 'rgb(48,48,48)',
    d: 'rgb(48,48,48)',
  };

  constructor(
    public dialogRef: MatDialogRef<DialogGiftComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GiftDialogData,
    private imagePicker: ImagePicker,
    private base64: Base64,
    private batteryStatus: BatteryStatus
  ) {}

  ngOnInit() {
    if (this.data.type == GiftType.BATTERY) {
      const subscription = this.batteryStatus.onChange().subscribe((status) => {
        let level = status.level;

        if (level >= 100) {
          Object.keys(this.colorBattery).map((key) => {
            this.colorBattery[key] = 'rgb(56,186,39)';
          });
        } else if (level >= 75) {
          this.colorBattery.b = 'rgb(255,43,10)';
          this.colorBattery.c = 'rgb(255,129,10)';
          this.colorBattery.d = 'rgb(56,186,39)';
        } else if (level >= 50) {
          this.colorBattery.c = 'rgb(255,129,10)';
          this.colorBattery.d = 'rgb(56,186,39)';
        } else if (level >= 25) {
          this.colorBattery.c = 'rgb(255,43,10)';
          this.colorBattery.d = 'rgb(255,129,10)';
        } else {
          this.colorBattery.d = 'rgb(255,43,10)';
        }

        this.data.outputMessage = 'B-';
        Object.keys(this.colorBattery).map((key) => {
          
          switch (this.colorBattery[key]) 
          {
            case 'rgb(255,43,10)':
              this.data.outputMessage += 'r-';
              break;
            case 'rgb(56,186,39)':
              this.data.outputMessage += 'g-';
              break;
            case 'rgb(255,129,10)':
              this.data.outputMessage += 'o-';
              break;
            case 'rgb(48,48,48)':
              this.data.outputMessage += 'n-';
              break;  
          }
        });
        
        this.data.outputMessage += 'B';

        this.isFinish = true;
        subscription.unsubscribe();
      });
    }
  }

  close(stop = false) {
    if (stop) {
      this.dialogRef.close(undefined);
    } else {
      this.dialogRef.close(this.data);
    }
  }

  onTextChange() {
    if (this.data.type == GiftType.IDEA) {
      if (this.textContent.length > 0 && this.textContent.length <= 500) {
        this.data.outputMessage = '| ' + this.textContent + ' |';
        this.isFinish = true;
      } else {
        this.isFinish = false;
      }
    } else if (this.data.type == GiftType.CODE) {
      if (this.textContent.length > 0 && this.textContent.length <= 1500) {
        this.data.outputMessage = "_code_ "+this.textContent+" _code_";
        this.isFinish = true;
      } else {
        this.isFinish = false;
      }
    }else if(this.data.type == GiftType.PHONE) 
    {
      if (this.textContent.length > 0 && this.textContent.length <= 10) {
        this.data.outputMessage = "#"+this.textContent+"#";
        this.isFinish = true;
      } else {
        this.isFinish = false;
      }
    }
  }

  openImage() {
    let options: ImagePickerOptions = {
      quality: 100,
      maximumImagesCount: 1,
      /*
      // 2160p
        width:3840, 
        height:2160,

      // 1440p
        width:2560, 
        height:1440,

      // 1080p
        width:1920, 
        height:1080,
      
      // 720p
        width:1280, 
        height:720,

      // 480p
        width:854, 
        height:480,

      // 360p
        width:640, 
        height:360,

      // 240p
        width:426, 
        height:240, 
      */
      width: 720,
      height: 1280,
      allow_video: false,
      title: 'Choisissez une image à envoyer',
    };

    this.imagePicker.getPictures(options).then((results) => {
      for (var i = 0; i < results.length; i++) {
        let res = results[i];
        if (res) {
          this.base64
            .encodeFile(res)
            .then((base64File: string) => {
              this.data.outputMessage = base64File;
              this.isFinish = true;
            })
            .catch((err) => {});
        }
      }
    });
  }
}
