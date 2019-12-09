import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileName' })
export class FileNamePipe implements PipeTransform {
  transform(value: string): string {
    return value.substr(value.lastIndexOf('/') + 1);
  }
}

@Pipe({ name: 'filePath' })
export class FilePathPipe implements PipeTransform {
  transform(value: string): string {
    return value.substr(0, value.lastIndexOf('/') + 1);
  }
}