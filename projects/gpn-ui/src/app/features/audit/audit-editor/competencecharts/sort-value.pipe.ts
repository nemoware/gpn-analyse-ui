import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortValue'
})
export class SortValuePipe implements PipeTransform {
  transform(value: any): any {
    value.sort((a: any, b: any) => {
      if (a.value.span[0] < b.value.span[0]) {
        return -1;
      } else if (a.value.span[0] > b.value.span[0]) {
        return 1;
      } else {
        return 0;
      }
    });
    return value;
  }
}
