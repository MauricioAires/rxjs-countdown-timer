import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { countdownTimer } from './shared/utils/countdown-timer';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // Services
  private destroy = inject(DestroyRef);
  private fb = inject(UntypedFormBuilder);

  // Form
  protected form = this.fb.group({
    interval: [1, Validators.required],
  });

  // Observables and Signals
  private countdownTrigger$ = new BehaviorSubject<number>(1);
  private interval = signal(this.form.get('interval')?.value || 1);
  protected remainingTime = signal(`${this.interval()}m 0s remaining.`);
  private currentTimestamp = signal(Date.now());
  private futureTimestamp = signal(
    this.calculateFutureTimestamp(this.interval())
  );

  // Helper Functions
  private calculateFutureTimestamp(interval: number): number {
    return Date.now() + interval * 60 * 1000;
  }

  // Lifecycle Hooks
  public ngOnInit(): void {
    this.startCountdownTimerObservable();
  }

  // Methods
  protected executeCountdownTimer(): void {
    const intervalValue = this.form.get('interval')?.value || 1;
    this.interval.set(intervalValue);
    this.currentTimestamp.set(Date.now());
    this.futureTimestamp.set(this.calculateFutureTimestamp(intervalValue));

    // Trigger countdown
    this.countdownTrigger$.next(intervalValue);
  }

  protected startCountdownTimerObservable(): void {
    this.countdownTrigger$
      .pipe(
        switchMap(() =>
          countdownTimer(this.currentTimestamp(), this.futureTimestamp())
        ),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe({
        next: ({ days, hours, minutes, seconds }: any) => {
          const timeString = `${minutes}m ${seconds}s remaining.`;
          console.log(`${days}d ${hours}h ${minutes}m ${seconds}s remaining.`);
          this.remainingTime.set(timeString);
        },
        complete: () => {
          console.log('Contagem regressiva finalizada!');
        },
      });
  }
}
