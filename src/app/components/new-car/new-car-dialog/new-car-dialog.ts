import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  output,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { take } from 'rxjs';
import { NewCar } from '../../../interfaces/new-car.interface';
import { CarService } from '../../../services/car/car.service';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-new-car-dialog',
  imports: [FormField],
  templateUrl: './new-car-dialog.html',
  styleUrl: './new-car-dialog.scss',
  standalone: true,
})
export class NewCarDialog implements AfterViewInit {
  @ViewChild('dialog') private dialog!: ElementRef<HTMLDialogElement>;

  public closed = output<boolean>();
  public message = signal('');
  public saveSucceeded = false;
  readonly newCarModel = signal<NewCar>({
    name: '',
    manufacturer: '',
    model: '',
    fuel: '',
    type: '',
    vin: '',
    color: '',
    mileage: null,
  });
  public newCarForm = form(this.newCarModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
    required(schemaPath.manufacturer, { message: 'Manufacturer is required' });
    required(schemaPath.model, { message: 'Model is required' });
    required(schemaPath.fuel, { message: 'Fuel is required' });
    required(schemaPath.type, { message: 'Car Type is required' });
    required(schemaPath.vin, { message: 'VIN is required' });
  });
  private carService = inject(CarService);
  private platformId = inject(PLATFORM_ID);

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.dialog.nativeElement.showModal();
    }
  }

  public closeDialog(): void {
    this.dialog.nativeElement.close();
  }

  public onDialogClick(event: MouseEvent): void {
    const dialog = this.dialog.nativeElement;
    const bounds = dialog.getBoundingClientRect();
    const clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (event.target === dialog && clickedOutside) {
      this.closeDialog();
    }
  }

  public saveNewCar(e: Event): void {
    e.preventDefault();
    const formValue = this.newCarModel();
    const nullableFields = ['color', 'mileage'];

    const hasEmptyStrings = Object.entries(formValue).some(([key, val]) => {
      if (nullableFields.includes(key)) {
        return false;
      }
      return typeof val === 'string' && val.trim() === '';
    });

    if (this.newCarForm().invalid() || hasEmptyStrings) {
      this.message.set('Please complete all required fields.');
      return;
    }

    this.carService
      .saveNewCar$(formValue)
      .pipe(take(1))
      .subscribe((response: boolean | HttpErrorResponse) => {
        if (typeof response === 'boolean') {
          this.saveSucceeded = response;
          this.closeDialog();
          return;
        }
        this.message.set('Error ' + response.status + ': ' + response.error);
      });
  }
}
