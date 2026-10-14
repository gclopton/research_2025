/** Vault.process calls this synchronously while holding its per-file write lock. */
export function checkedReplacement(current: string, expected: string, next: string): string {
  if (current !== expected)
    throw new Error(
      'This file changed outside this editor. Your draft is preserved; save a recovery copy before reloading.',
    );
  return next;
}
