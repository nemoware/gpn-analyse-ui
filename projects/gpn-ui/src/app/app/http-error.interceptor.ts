import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';

export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private translate: TranslateService) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          //client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          //server-side error
          errorMessage =
            error.error.details != null ? error.error.details : error.message;
          if (error.status === 400) {
            window.alert(error.error);
          }
        }
        return throwError(errorMessage);
      })
    );
  }
}
