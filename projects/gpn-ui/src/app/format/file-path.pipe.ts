import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileName' })
export class FileNamePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }
    return value.substr(value.lastIndexOf('/') + 1);
  }
}

@Pipe({ name: 'filePath' })
export class FilePathPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }
    return value.substr(0, value.lastIndexOf('/') + 1);
  }
}

@Pipe({ name: 'docNumber' })
export class DocNumberPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }
    return '№' + value
  }
}



@Pipe({ name: 'orgName' })
export class OrgNamePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    let ret = value
    if (!ret.startsWith('«')) {
      ret = '«' + ret;
    }

    if (!ret.endsWith('»')) {
      ret = ret + '»';
    }

    return ret
  }
}