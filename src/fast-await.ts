import { timeoutPromise,  timeoutPromiseResolve,
  timeoutPromiseReject, } from './timer';

const fastAwait = async () => {
  const p1 = timeoutPromise(3000);
  const p2 = timeoutPromise(3000);
  const p3 = timeoutPromise(3000);

  await p1;
  await p2;
  await p3;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const fastAwaitTest = async () => {
  const startTime = Date.now();
  fastAwait().then(() => {
    const finishTime = Date.now();
    const timeTaken = finishTime - startTime;
    console.log('Fast await time taken in milliseconds: ' + timeTaken);
  });
};

const fastAwaitWithReject = async () => {
  const p1 = timeoutPromiseResolve(5000);
  const p2 = timeoutPromiseReject(2000);
  const p3 = timeoutPromiseResolve(3000);

  await p1;
  await p2;
  await p3;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const fastAwaitWithSlowRejectTest = async () => {
  const startTime = Date.now();
  fastAwaitWithReject()
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .then(() => {})
    .catch((e) => {
      console.error(e);
      const finishTime = Date.now();
      const timeTaken = finishTime - startTime;
      console.log('Fast await with slow reject time taken in milliseconds: ' + timeTaken);
    });
};

const fastAwaitWithFastReject = async () => {
  const p1 = timeoutPromiseResolve(5000);
  const p2 = timeoutPromiseReject(2000);
  const p3 = timeoutPromiseResolve(3000);

  return await Promise.all([p1, p2, p3]);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const fastAwaitWithFastRejectTest = async () => {
  const startTime = Date.now();
  fastAwaitWithFastReject()
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .then(() => {})
    .catch((e) => {
      console.error(e);
      const finishTime = Date.now();
      const timeTaken = finishTime - startTime;
      console.log('Fast await with fast reject time taken in milliseconds: ' + timeTaken);
    });
};
