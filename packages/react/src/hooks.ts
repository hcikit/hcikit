import { noop } from "lodash-es";
import { useEffect, useState } from "react";

export function useTimer(
  durationInMilliseconds: number,
  startTime = Date.now(),
  fps = 30,
  callback = noop
): {
  startTime: number;
  endTime: number;
  formattedTime: string;
  millisecondsRemaing: number;
} {
  const [_, setUpdate] = useState(0);

  const endTime = startTime + durationInMilliseconds;
  const millisecondsRemaing = Math.max(0, endTime - startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdate((i) => i + 1);
      const endTime = startTime + durationInMilliseconds;

      if (Date.now() > endTime) {
        callback();
      }
    }, 1000 / fps);

    return () => {
      clearInterval(interval);
    };
  }, [fps, startTime]);

  return {
    startTime: startTime,
    endTime: startTime + durationInMilliseconds,
    millisecondsRemaing,
    formattedTime: `${millisecondsRemaing / 1000}:`,
  };
}
