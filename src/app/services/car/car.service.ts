import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  take,
  throwError,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { Car } from '../../interfaces/car.interface';
import { NewCar } from '../../interfaces/new-car.interface';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private baseUrl = environment.apiUrl;

  private carListSubject = new BehaviorSubject<Car[]>([]);
  public carList$: Observable<Car[]> = this.carListSubject.asObservable();

  private carListLoadingSubject = new BehaviorSubject<boolean>(false);
  public isCarListLoading$: Observable<boolean> =
    this.carListLoadingSubject.asObservable();

  private detailsLoadingSubject = new BehaviorSubject<boolean>(false);
  public isDetailsLoading$: Observable<boolean> =
    this.detailsLoadingSubject.asObservable();

  private notificationSubject = new BehaviorSubject<string | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  private notificationTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(private httpClient: HttpClient) {
    this.updateCarList$();
  }

  public updateCarList$(): void {
    this.carListLoadingSubject.next(true);
    this.httpClient
      .get<Car[]>(this.baseUrl + '/vehicles')
      .pipe(
        take(1),
        catchError((error) => {
          this.showNotification('Error getting data, please try again.');
          return throwError(() => error);
        })
      )
      .subscribe((carList) => {
        this.carListSubject.next(carList);
        this.carListLoadingSubject.next(false);
      });
  }

  public getCarById$(carId: string): Observable<Car> {
    return this.httpClient.get<Car>(this.baseUrl + `/vehicles/${carId}`);
  }

  public saveNewCar$(newCar: NewCar): Observable<boolean | HttpErrorResponse> {
    return this.httpClient.post<Car>(this.baseUrl + '/vehicles', newCar).pipe(
      map(() => {
        this.updateCarList$();
        return true;
      }),
      catchError((err: HttpErrorResponse) => {
        console.error(err);
        this.showNotification(String(err.error));
        return of(err);
      })
    );
  }

  public dismissNotification(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = undefined;
    }
    this.notificationSubject.next(null);
  }

  private showNotification(message: string): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notificationSubject.next(message);
    this.notificationTimeout = setTimeout(
      () => this.dismissNotification(),
      3000,
    );
  }
}
