import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'messageRender',
})
export class MessageRenderPipe implements PipeTransform {
  constructor(private http: HttpClient) {}

  transform(value: string): string {
    let response = value
      ?.replace(/&/g, '&amp;')
      ?.replace(/>/g, '&gt;')
      ?.replace(/</g, '&lt;')
      ?.replace(/"/g, '&quot;');

    response = this.URL(response);
    response = this.IDEA(response);
    response = this.BATTERY(response);

    return response;
  }

  BATTERY(response) {
    let batt = response ? response.split('-') : [];
    if (batt.length == 6 && batt[0] == 'B' && batt[batt.length - 1] == 'B') 
    {
      let res = '<div class="power">';
      for (let i = 1; i < 5; i++) {
        res += '\n\t<div class="case-p-el bk-' + batt[i] + '"></div>';
      }
      res += '\n</div>';
      return res;
    }
    return response;
  }

  IDEA(response) {
    let res = response;
    res = res?.replace(/\|(.*?)\|/g, '<i> $1 </i>');
    res = res?.replace(/\*(.*?)\*/g, '<b> $1 </b>');
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
