import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent {

  constructor() {
    if (!localStorage.getItem('settings')) {
      localStorage.setItem(
        'settings',
        JSON.stringify({
          saveMessage: false,
          saveImage: false,
          saveRoom: false,
          showUsersTag:true,
          showSelfTag:true,
          showToast:true,
          defaultRoom: 0,
          userName:'default'
        })
      );
    }
  }

  getSettings() {
    return JSON.parse(localStorage.getItem('settings'));
  }

  setSettings(settings)
  {
    localStorage.removeItem('settings');
    localStorage.setItem('settings', JSON.stringify(settings));
  }
}
