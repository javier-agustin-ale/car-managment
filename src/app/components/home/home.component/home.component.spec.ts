import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Car } from '../../../interfaces/car.interface';
import { CarService } from '../../../services/car/car.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let router: jasmine.SpyObj<Router>;
  let carsSubject: BehaviorSubject<Car[]>;

  const createCar = (id: number): Car => ({
    id: String(id),
    name: `Car ${String(id).padStart(2, '0')}`,
    manufacturer: 'Manufacturer',
    model: 'Model',
    fuel: 'Electric',
    type: 'Hatchback',
    vin: `VIN-${id}`,
    color: 'Blue',
    mileage: id,
  });

  beforeEach(async () => {
    carsSubject = new BehaviorSubject(
      Array.from({ length: 55 }, (_, index) => createCar(54 - index)),
    );
    const loadingSubject = new BehaviorSubject(false);
    const notificationSubject = new BehaviorSubject<string | null>(null);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
      ],
    })
      .overrideComponent(HomeComponent, {
        set: {
          providers: [
            {
              provide: CarService,
              useValue: {
                carList$: carsSubject.asObservable(),
                isCarListLoading$: loadingSubject.asObservable(),
                notification$: notificationSubject.asObservable(),
                updateCarList$: jasmine.createSpy(),
                dismissNotification: jasmine.createSpy(),
              },
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('sorts cars and paginates them with the existing page sizes', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('tbody .row').length).toBe(50);
    expect(element.querySelector('tbody .row')?.textContent).toContain(
      'Car 00',
    );
    expect(element.querySelector('.range')?.textContent?.trim()).toBe(
      '1-50 of 55',
    );

    element.querySelector<HTMLButtonElement>('[aria-label="Next page"]')?.click();
    fixture.detectChanges();

    expect(element.querySelectorAll('tbody .row').length).toBe(5);
    expect(element.querySelector('.range')?.textContent?.trim()).toBe(
      '51-55 of 55',
    );

    const pageSize = element.querySelector<HTMLSelectElement>('select');
    if (!pageSize) {
      fail('Expected a page size selector');
      return;
    }
    pageSize.value = '10';
    pageSize.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.querySelectorAll('tbody .row').length).toBe(10);
    expect(element.querySelector('.range')?.textContent?.trim()).toBe(
      '1-10 of 55',
    );
  });

  it('navigates to the selected car details', () => {
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLElement>('tbody .row')?.click();

    expect(router.navigate).toHaveBeenCalledWith(['/car', '0']);
  });
});
