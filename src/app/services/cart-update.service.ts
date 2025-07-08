import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartUpdateService {
  
  private cartChangedSubject = new Subject<void>();

  
  cartChanged$: Observable<void> = this.cartChangedSubject.asObservable();

  constructor() { }

  notifyCartChanged(): void {
    this.cartChangedSubject.next();
  }
}
