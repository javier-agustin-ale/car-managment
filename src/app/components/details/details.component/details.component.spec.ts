import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  Router,
} from '@angular/router';
import { of } from 'rxjs';
import { Car } from '../../../interfaces/car.interface';
import { CarService } from '../../../services/car/car.service';
import { DetailsComponent } from './details.component';

describe('DetailsComponent', () => {
  let fixture: ComponentFixture<DetailsComponent>;

  const car: Car = {
    id: '42',
    name: 'Test car',
    manufacturer: 'Test manufacturer',
    model: 'Test model',
    fuel: 'Electric',
    type: 'Hatchback',
    vin: 'TEST-VIN',
    color: 'Blue',
    mileage: 12000,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: car.id })) },
        },
        {
          provide: CarService,
          useValue: { getCarById$: () => of(car) },
        },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the car details returned for the route id', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain(car.name);
    expect(element.querySelector('tbody')?.textContent).toContain(car.id);
    expect(element.querySelector('tbody')?.textContent).toContain(car.manufacturer);
    expect(element.querySelector('tbody')?.textContent).toContain(car.model);
  });
});
