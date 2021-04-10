import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../modal-room/modal-room.page';

@Component({
  selector: 'app-dialog-room',
  templateUrl: './dialog-room.component.html',
  styleUrls: ['./dialog-room.component.scss'],
})
export class DialogRoomComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogRoomComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {}

 

  close(setUndef = true): void 
  {
    if(!setUndef) 
    {
      this.dialogRef.close(undefined);
    }else
    {
      this.dialogRef.close(this.data);
    }
  }

}
