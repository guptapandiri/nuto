import { useId } from 'react';
import { cn } from '@/lib/cn';

interface FieldShellProps {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean;
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
    className: string;
  }) => React.ReactNode;
}

const controlClass =
  'w-full rounded-lg border bg-shell px-3 py-2.5 text-[16px] text-ink placeholder:text-ink-muted transition-colors focus:outline-none';

/**
 * Wraps a control with its label, hint and error, wiring up the aria
 * relationships. Note the 16px font size on controls — anything smaller makes
 * iOS Safari zoom the viewport on focus, which feels broken on mobile.
 */
export function Field({ label, error, hint, required, children }: FieldShellProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>

      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy || undefined,
        className: cn(
          controlClass,
          error
            ? 'border-danger focus:border-danger'
            : 'border-line focus:border-cashew-deep',
        ),
      })}

      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
