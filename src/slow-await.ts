import { timeoutPromise } from './timer';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const slowAwait = async () => {
  await timeoutPromise(3000);
  await timeoutPromise(3000);
  await timeoutPromise(3000);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const slowAwaitTest = async () => {
  const startTime = Date.now();
  slowAwait().then(() => {
    const finishTime = Date.now();
    const timeTaken = finishTime - startTime;
    console.log('Slow await time taken in milliseconds: ' + timeTaken);
  });
};
