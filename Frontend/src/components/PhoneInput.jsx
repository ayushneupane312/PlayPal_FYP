import { useId, useState } from 'react';
import { filterPhoneInput, getPhoneFieldError } from '../utils/phoneValidation';
import { RequiredMark } from './RequiredMark';

/**
 * Required phone: 10 digits (Nepal) or +977 + 10 digits.
 * Real-time errors after first blur or once user has typed any character.
 */
export default function PhoneInput({
  label,
  name,
  value,
  onChange,
  onValueChange,
  required = false,
  placeholder = '9841234567 or +9779841234567',
  hint = 'Use 10 digits, or +977 followed by 10 digits.',
  hideHint = false,
  disabled = false,
  className = '',
  id: idProp,
  inputClassName = '',
}) {
  const rid = useId();
  const id = idProp || `phone-input-${rid}`;
  const [touched, setTouched] = useState(false);

  const hasChars = String(value ?? '').trim().length > 0;
  const effectiveTouched = touched || hasChars;
  const error = getPhoneFieldError(value, effectiveTouched);

  const handleChange = (e) => {
    const filtered = filterPhoneInput(e.target.value);
    if (onValueChange) onValueChange(filtered);
    else if (onChange) onChange({ target: { name, value: filtered } });
  };

  const border = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:ring-emerald-500';

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required ? <RequiredMark className="inline" /> : null}
        </label>
      ) : null}
      <input
        id={id}
        type="text"
        inputMode="tel"
        autoComplete="tel"
        name={name}
        value={value ?? ''}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${border} disabled:bg-gray-50 disabled:text-gray-500 ${inputClassName}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {hint && !hideHint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}
      {error ? (
        <p id={`${id}-err`} className="text-sm text-red-600 mt-1" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
