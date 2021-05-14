import { timeoutPromise } from './timer';

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
