export function withTimeout(promise, ms = 10000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject({ code: 'unavailable', message: 'Network problem. Please check your connection and try again.' }),
      ms
    )
  );
  return Promise.race([promise, timeout]);
}