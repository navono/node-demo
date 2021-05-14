// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function timeoutPromise(interval) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve('done');
    }, interval);
  });
}

export function timeoutPromiseResolve(interval) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve('successful');
    }, interval);
  });
}

export function timeoutPromiseReject(interval) {
  return new Promise((_, reject) => {
    setTimeout(function () {
      reject('error');
    }, interval);
  });
}
