/**
 * Выполняет async-функцию и возвращает либо её результат (если завершилась вовремя),
 * либо `false` — если время истекло.
 *
 * @param fn - асинхронный колбэк: () => Promise<T>
 * @param ms - время в миллисекундах
 * @returns результат типа T или false при таймауте
 */
export async function tryToMakeInTime<T>(
  fn: () => Promise<T>,
  ms: number,
): Promise<T | false> {
  const p = fn();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<false>((resolve) => {
    timeoutId = setTimeout(() => resolve(false), ms);
  });

  try {
    const result = await Promise.race([p, timeout]);
    if (result === false) {
      // если таймаут выиграл — подавляем возможное позднее отклонение оригинального промиса,
      // чтобы не получить unhandled rejection (практический хак).
      p.catch(() => {});
      return false;
    }
    clearTimeout(timeoutId);
    return result as T;
  } catch (err) {
    clearTimeout(timeoutId);
    // если колбэк бросил ошибку ДО таймаута — пробрасываем дальше
    throw err;
  }
}
