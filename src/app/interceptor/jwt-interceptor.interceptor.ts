import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { Observable } from 'rxjs'; 

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const jwtInterceptorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);


  const addToken = (request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> => {
    return token ? request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }) : request;
  };

  let modifiedReq = addToken(req, authService.getToken());

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (error.status === 401 && error.error?.message === 'JWT Token has expired') {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null); 

          const refreshToken = authService.getRefreshToken();
          if (!refreshToken) {
           
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => new Error('Refresh token missing or invalid.'));
          }

          console.log('Interceptor: Access token expired. Attempting refresh...');
          return from(authService.refreshToken()).pipe(
            switchMap((res: { token: string; refreshToken: string }) => { 
              isRefreshing = false;
              authService.saveToken(res.token);         
              authService.saveRefreshToken(res.refreshToken); 
              refreshTokenSubject.next(res.token);      
              console.log('Interceptor: Token refreshed successfully. Retrying original request.');
              return next(addToken(req, res.token)); 
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              console.error('Interceptor: Failed to refresh token.', refreshErr);
              authService.logout(); 
              router.navigate(['/login']);
              return throwError(() => refreshErr);
            })
          );
        } else {
          
          console.log('Interceptor: Refresh in progress. Queuing request...');
          return refreshTokenSubject.pipe(
            filter(token => token !== null), 
            take(1),                      
            switchMap(token => {
              console.log('Interceptor: Retrying queued request with new token.');
              return next(addToken(req, token)); 
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
