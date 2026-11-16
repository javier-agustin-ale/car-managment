import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { NEVER, Observable, take } from 'rxjs';
import { Car } from '../../../interfaces/car.interface';
import { CarService } from '../../../services/car/car.service';
import { NewCarDialog } from '../../new-car/new-car-dialog/new-car-dialog';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginator,
    MatProgressBarModule,
    NewCarDialog,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [CarService],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class HomeComponent implements OnInit {
  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  public carsList$: Observable<Car[]> = NEVER;
  public isCarListLoading$: Observable<boolean> = NEVER;
  public isNewCarDialogOpen = false;

  public displayedColumns: string[] = [
    'name',
    'manufacturer',
    'model',
    'milage',
  ];
  public dataSource: MatTableDataSource<Car> = new MatTableDataSource();

  private carService = inject(CarService);
  private router = inject(Router);

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
      const carList: Car[] = list.sort((a, b) => a.name.localeCompare(b.name));
      this.dataSource.data = carList;
    });
  }
}
