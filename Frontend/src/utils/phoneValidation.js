/**
 * Nepal phone rules:
 * - Exactly 10 digits (national), or
 * - +977 followed by exactly 10 digits (e.g. +9779841234567)
 */

export const PHONE_MESSAGES = {
  required: 'Phone number is required',
  nonNumeric: 'Only numbers are allowed',
  length: 'Phone number must be 10 digits',
  invalid: 'Invalid phone number format',
};

/** Strip spaces; keep optional leading + and digits only (max lengths enforced). */
export function filterPhoneInput(raw) {
  const v = String(raw ?? '');
  if (v === '') return '';
  if (v === '+') return '+';
  if (v.startsWith('+')) {
    const digits = v.slice(1).replace(/\D/g, '');
    return '+' + digits.slice(0, 13);
  }
  return v.replace(/\D/g, '').slice(0, 10);
}

/**
 * Full validation (submit). Empty value returns `required`.
 */
export function getPhoneValidationError(value) {
  const s = String(value ?? '')
    .trim()
    .replace(/\s/g, '');
  if (!s) return PHONE_MESSAGES.required;

  if (s.startsWith('+')) {
    const afterPlus = s.slice(1);
    if (!/^\d+$/.test(afterPlus)) return PHONE_MESSAGES.nonNumeric;
    if (!afterPlus.startsWith('977')) {
      if (afterPlus.length < 3) return PHONE_MESSAGES.invalid;
      return PHONE_MESSAGES.invalid;
    }
    const national = afterPlus.slice(3);
    if (national.length !== 10) return PHONE_MESSAGES.length;
    return null;
  }

  if (!/^\d+$/.test(s)) return PHONE_MESSAGES.nonNumeric;
  if (s.length !== 10) return PHONE_MESSAGES.length;
  return null;
}

/**
 * Inline / real-time: no "required" until field is touched; once typing, show format errors.
 */
export function getPhoneFieldError(value, touched) {
  const s = String(value ?? '').trim();
  if (!s) {
    return touched ? PHONE_MESSAGES.required : null;
  }
  return getPhoneValidationError(value);
}

export function isValidPhone(value) {
  return getPhoneValidationError(value) == null;
}
