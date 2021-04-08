import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'messageRender'
})
export class MessageRenderPipe implements PipeTransform {

  transform(value: string):  string
  {
    let response = value.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    
    response.match(/https?:\/\/(www\.)?([a-zA-Z0-9:\/\?\.\=\&\%\-]+)/g)?.map(url=>{
      response = response.replace(url,`<a href="${url}" target="_BLANK">${url}</a>`);
    })

    response.match(/\@[a-zA-Z0-9\_\.]+/g)?.map(tag=>{
      response = response.replace(tag,`<i>${tag}</i>`);
    })
    
    return response;
  }

}
