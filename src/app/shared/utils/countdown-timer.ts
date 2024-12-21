import { interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import {
  differenceInSeconds,
  formatDuration,
  intervalToDuration,
} from 'date-fns';

export function countdownTimer(
  currentTimestamp: number,
  futureTimestamp: number
): any {
  if (futureTimestamp <= currentTimestamp) {
    console.error(
      'The future date must be greater than the current timestamp.'
    );
    return;
  }

  const timeDifference = futureTimestamp - currentTimestamp; // Difference in milliseconds
  const intervalMs = 1000; // Interval of 1 second

  return interval(intervalMs).pipe(
    map((elapsedSeconds) => {
      const remainingMs = timeDifference - elapsedSeconds * intervalMs;

      const remainingDuration = intervalToDuration({
        start: 0,
        end: remainingMs,
      });
      return {
        days: remainingDuration.days || 0,
        hours: remainingDuration.hours || 0,
        minutes: remainingDuration.minutes || 0,
        seconds: remainingDuration.seconds || 0,
      };
    }),
    takeWhile(
      ({ days, hours, minutes, seconds }) =>
        days > 0 || hours > 0 || minutes > 0 || seconds >= 0
    )
  );
}
