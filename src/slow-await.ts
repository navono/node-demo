import {
  timeoutPromise,
  timeoutPromiseResolve,
  timeoutPromiseReject,
} from './timer';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const slowAwait = async () => {
  await timeoutPromise(3000);
  await timeoutPromise(3000);
  await timeoutPromise(3000);
};

const slowAwaitWithReject = async () => {
  await timeoutPromiseResolve(5000);
  await timeoutPromiseReject(2000);
  await timeoutPromiseResolve(3000);
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const slowAwaitErrorTest = async () => {
  const startTime = Date.now();
  slowAwaitWithReject()
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .then(() => {})
    .catch((e) => {
      console.error(e);
      const finishTime = Date.now();
      const timeTaken = finishTime - startTime;
      console.log('Slow await error handle time taken in milliseconds: ' + timeTaken);
    });
};
