import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { NewCar } from '../../../interfaces/new-car.interface';
import { CarService } from '../../../services/car/car.service';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-new-car-dialog',
  imports: [
    MatDialogModule,
    MatDialogContent,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    FormField,
  ],
  templateUrl: './new-car-dialog.html',
  styleUrl: './new-car-dialog.scss',
  standalone: true,
})
export class NewCarDialog {
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
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<NewCarDialog>);

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
      this.showSnackBar('Please complete all required fields.', 'Accept');
      return;
    }

    this.carService
      .saveNewCar$(formValue)
      .pipe(take(1))
      .subscribe((response: boolean | HttpErrorResponse) => {
        if (typeof response === 'boolean') {
          this.dialogRef.close(response);
          return;
        }
        this.showSnackBar(
          'Error ' + response.status + ': ' + response.error,
          'Accept',
        );
      });
  }

  private showSnackBar(message: string, button: string): void {
    this.snackBar.open(message, button, {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
