// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function timeoutPromise(interval) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve('done');
    }, interval);
  });
}
