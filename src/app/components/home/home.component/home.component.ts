import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NEVER, Observable, take } from 'rxjs';
import { Car } from '../../../interfaces/car.interface';
import { CarService } from '../../../services/car/car.service';
import { NewCarDialog } from '../../new-car/new-car-dialog/new-car-dialog';

@Component({
  selector: 'app-home',
  imports: [CommonModule, NewCarDialog],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [CarService],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class HomeComponent implements OnInit {
  public carsList$: Observable<Car[]> = NEVER;
  public isCarListLoading$: Observable<boolean> = NEVER;
  public isNewCarDialogOpen = false;
  public cars = signal<Car[]>([]);
  public pageIndex = signal(0);
  public pageSize = signal(10);
  public pageSizeOptions = [10, 20, 50, 100];
  public visibleCars = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.cars().slice(start, start + this.pageSize());
  });
  public pageCount = computed(() =>
    Math.max(1, Math.ceil(this.cars().length / this.pageSize())),
  );
  public rangeStart = computed(() =>
    this.cars().length === 0 ? 0 : this.pageIndex() * this.pageSize() + 1,
  );
  public rangeEnd = computed(() =>
    Math.min((this.pageIndex() + 1) * this.pageSize(), this.cars().length),
  );

  private carService = inject(CarService);
  private router = inject(Router);
  public notification$ = this.carService.notification$;

  public ngOnInit(): void {
    this.defineStreams();
  }

  public rowSelected(carId: string): void {
    this.router.navigate(['/car', carId]);
  }

  public addNewCar(): void {
    this.isNewCarDialogOpen = true;
  }

  public closeNewCarDialog(saved: boolean): void {
    this.isNewCarDialogOpen = false;
    if (saved) {
      this.carService.updateCarList$();
    }
  }

  public defineStreams(): void {
    this.isCarListLoading$ = this.carService.isCarListLoading$;
    this.carsList$ = this.carService.carList$;

    this.carsList$.subscribe((list) => {
      const carList = [...list].sort((a, b) => a.name.localeCompare(b.name));
      this.cars.set(carList);
      this.pageIndex.update((index) =>
        Math.min(index, Math.max(0, this.pageCount() - 1)),
      );
    });
  }

  public changePageSize(event: Event): void {
    const pageSize = Number((event.target as HTMLSelectElement).value);
    if (this.pageSizeOptions.includes(pageSize)) {
      this.pageSize.set(pageSize);
      this.pageIndex.set(0);
    }
  }

  public goToFirstPage(): void {
    this.pageIndex.set(0);
  }

  public goToPreviousPage(): void {
    this.pageIndex.update((index) => Math.max(0, index - 1));
  }

  public goToNextPage(): void {
    this.pageIndex.update((index) => Math.min(this.pageCount() - 1, index + 1));
  }

  public goToLastPage(): void {
    this.pageIndex.set(this.pageCount() - 1);
  }

  public dismissNotification(): void {
    this.carService.dismissNotification();
  }
}
