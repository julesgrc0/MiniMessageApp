import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { Base64 } from '@ionic-native/base64/ngx';

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
  providers: [ImagePicker, Base64],
})
export class DialogGiftComponent implements OnInit {
  public isFinish = false;

  constructor(
    public dialogRef: MatDialogRef<DialogGiftComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GiftDialogData,
    private imagePicker: ImagePicker,
    private base64: Base64
  ) {}

  ngOnInit() {}

  close(stop = false) {
    if (stop) {
      this.dialogRef.close(undefined);
    } else {
      this.dialogRef.close(this.data);
    }
  }

  openImage() {
    let options:ImagePickerOptions = {
      quality:40,
      maximumImagesCount: 1,
      width:144,
      height:81,
      allow_video:false,
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
            .catch((err) =>{});
        }
      }
    });
  }
}
