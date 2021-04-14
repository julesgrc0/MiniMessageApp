import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'messageRender'
})
export class MessageRenderPipe implements PipeTransform {

  constructor(private http: HttpClient) { }

  transform(value: string):  string
  {
    let response = value.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    response = this.URL(response);
    response = this.IDEA(response);

    return response;
  }

  IDEA(response)
  {
    let res = response;
    res = res.replace(/\|(.*?)\|/g,"<i>\" $1 \"</i>");
    return res;
  }

  URL(response)
  {
    let res = response;
    response.match(/https?:\/\/(www\.)?([a-zA-Z0-9:\/\?\.\=\&\%\-\_\@]+)/g)?.map(url=>{
      res = response.replace(url,`<a href="${url}" target="_BLANK">${url}</a>`);
    })

    response.match(/\@[a-zA-Z0-9\_\.]+/g)?.map(tag=>{
      res = response.replace(tag,`<i>${tag}</i>`);
    })
    return res;
  }
}
