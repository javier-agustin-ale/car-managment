
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { Car } from '../../../interfaces/car.interface';
import { CarService } from '../../../services/car/car.service';

@Component({
  selector: 'app-details.component',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class DetailsComponent implements OnInit {
  public cars = signal<Car[]>([]);
  public carName = signal('');

  private carService = inject(CarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public ngOnInit(): void {
    this.getIdFromUrl();
  }

  public navigateBack(): void {
    this.router.navigate(['']);
  }

  private getIdFromUrl(): void {
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const carId = params.get('id');
      if (carId) {
        this.carService.getCarById$(carId).subscribe((car) => {
          this.cars.set([car]);
          this.carName.set(car.name);
        });
      }
    });
  }
}
