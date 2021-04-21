import { Pipe, PipeTransform } from '@angular/core';
import { gameList } from './game-list';
@Pipe({
  name: 'messageRender',
})
export class MessageRenderPipe implements PipeTransform {
  constructor() {}

  transform(value: string): string {
    let response = value
      ?.replace(/&/g, '&amp;')
      ?.replace(/>/g, '&gt;')
      ?.replace(/</g, '&lt;')
      ?.replace(/"/g, '&quot;');

    let tempRes = this.CODE(response);
    if (tempRes != response) {
      return tempRes;
    }

    tempRes = this.BATTERY(response);
    if (tempRes != response) {
      return tempRes;
    }

    tempRes = this.GAME(response);
    if (tempRes != response) {
      return tempRes;
    }

    tempRes = this.INFO(response);
    if (tempRes != response) {
      return tempRes;
    }

    tempRes = this.LOVE(response);
    if (tempRes != response) {
      return tempRes;
    }

    response = this.URL(response);

    response = this.IDEA(response);

    response = this.PHONE(response);

    response = this.MAP(response);

    return response;
  }

  INFO(response) 
  {
    let res = response+'';
    res = res.split('\n').join('<br>');
    res = res.replace(/\_header\_(.*?)\_header\_/g, '<i class="info-header">$1</i><br>');
    return res;
  }

  MAP(response) {
    let res = response;
    res?.match(/\{[\-0-9\.]+\,[\-0-9\.]+\}/g)?.map((item) => {
      let it = item.replace('{', '');
      it = it.replace('}', '');
      let coord = it.split(',');

      if (coord.length == 2) {
        res = res.replace(
          item,
          "<a href='https://www.google.com/maps/?q=" +
            coord.join(',') +
            "' target='_BLANK'>" +
            coord.join(',') +
            '</a>'
        );
      }
    });
    return res;
  }

  GAME(response) {
    let res = response + '';

    if (res.startsWith('game-') && res.endsWith('-game')) {
      res = res.replace('game-', '');
      res = res.replace('-game', '');
      res = res.replace(/\&quot\;/g, '"');
      try {
        let game = JSON.parse(res);
        res = '<div class="msg-game">';
        res += '<img src="' + gameList[game.image] + '" class="game-image"/>';
        res += '<p class="user-game">' + game.text + '</p>';
        res += '</div>';
        return res;
      } catch {
        return response;
      }
    } else {
      return response;
    }
  }

  PHONE(response) {
    let res = response;
    res = res?.replace(/\#(.*?)\#/g, '<a href="tel:$1">$1</a>');
    return res;
  }

  LOVE(response) {
    let lov = response ? response.split('-') : [];

    if (lov.length == 6 && lov[0] == 'L' && lov[lov.length - 1] == 'L' && lov[2] == 'X')
    {
      let user1 = lov[1],user2 = lov[3];
      let level = lov[lov.length - 2];
      let res = '<div class="love-msg">';
      res += '<i class="love-1">'+user1+'</i>';
      res += '<i class="love-lv">'+level+'</i>';
      res += '<div class="love-heart"></div>';
      res += '<i class="love-2">'+user2+'</i>';
      res += '</div>';
      return res;
    }
    return response;
  }

  BATTERY(response) {
    let batt = response ? response.split('-') : [];
    if (batt.length == 6 && batt[0] == 'B' && batt[batt.length - 1] == 'B') {
      let res = '<div class="power">';
      for (let i = 1; i < 5; i++) {
        res += '\n\t<div class="case-p-el bk-' + batt[i] + '"></div>';
      }
      res += '\n</div>';
      return res;
    }
    return response;
  }

  CODE(response) {
    let res = response;
    let code = res?.split('_code_') || [];
    if (code.length === 3) {
      res = '<pre class="code-content">' + code[1] + '</pre>';
    }

    return res;
  }

  IDEA(response) {
    let res = response;
    res = res?.replace(/\%(.*?)\%/g, '<i class="box-i"> $1 </i>');
    res = res?.replace(/\|(.*?)\|/g, '<i> $1 </i>');
    res = res?.replace(/\*(.*?)\*/g, '<b> $1 </b>');
    res = res?.replace(/\&amp\;(.*?)\&amp\;/g, '<i class="spoiler"> $1 </i>');
    return res;
  }

  URL(response) {
    let res = response;
    response
      ?.match(/https?:\/\/(www\.)?([a-zA-Z0-9:\/\?\.\=\&\%\-\_\@]+)/g)
      ?.map((url) => {
        res = response.replace(
          url,
          `<a href="${url}" target="_BLANK">${url}</a>`
        );
      });

    response?.match(/\@[a-zA-Z0-9\_\.]+/g)?.map((tag) => {
      res = response?.replace(tag, `<i>${tag}</i>`);
    });
    return res;
  }
}
