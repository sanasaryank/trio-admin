import type { FieldErrors } from 'react-hook-form';

const FIELD_ERROR = 'message';

function flattenErrorKeys(errors: FieldErrors<Record<string, unknown>>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(errors)) {
    const value = errors[key];
    if (!value || typeof value !== 'object') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      FIELD_ERROR in value &&
      typeof (value as Record<string, unknown>)[FIELD_ERROR] !== 'object'
    ) {
      keys.push(path);
    } else {
      keys.push(
        ...flattenErrorKeys((value as FieldErrors<Record<string, unknown>>) ?? {}, path)
      );
    }
  }
  return keys;
}

function findFirstErrorElement(
  root: Document | HTMLElement,
  errorKeys: string[]
): HTMLElement | null {
  if (errorKeys.length === 0) return null;
  const set = new Set(errorKeys);
  const candidates = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input[name], textarea[name], select[name]'
  );
  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    const name = el.getAttribute('name');
    if (name && set.has(name)) return el;
  }
  return null;
}

/**
 * Scrolls to and focuses the first invalid field from react-hook-form errors.
 * Use as the second argument to handleSubmit: handleSubmit(onValid, scrollToFirstError).
 *
 * @param errors - FieldErrors from react-hook-form (onInvalid callback argument)
 * @param scrollContainer - Optional scrollable container (e.g. DialogContent ref). If not provided, searches document.
 */
export function scrollToFirstError<T extends Record<string, unknown>>(
  errors: FieldErrors<T>,
  scrollContainer?: HTMLElement | null
): void {
  try {
    const keys = flattenErrorKeys(errors as FieldErrors<Record<string, unknown>>);
    const root = scrollContainer ?? document;
    const element = findFirstErrorElement(root, keys);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof element.focus === 'function') {
      element.focus({ preventScroll: true });
    }
  } catch {
    // Fail silently
  }
}
