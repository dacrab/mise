import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function FormField({ label, id, type, value, onChange, placeholder, error, autoComplete }: {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  autoComplete?: string;
}) {
  let defaultAutoComplete = "name";
  if (type === "email") defaultAutoComplete = "email";
  else if (type === "password") defaultAutoComplete = "current-password";
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-charcoal-light mb-2">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field ${error ? "border-terracotta" : ""}`}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        autoComplete={autoComplete ?? defaultAutoComplete}
      />
      {error && <p id={errorId} className="text-xs text-terracotta mt-1">{error}</p>}
    </div>
  );
}

export function PasswordField({ label, value, onChange, show, onToggleShow, autoComplete, strengthMeter }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete?: string;
  strengthMeter?: { strength: number; colors: string[]; labels: string[] };
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal-light mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pr-10"
          placeholder="••••••••"
          autoComplete={autoComplete ?? "current-password"}
          aria-describedby={strengthMeter ? "password-strength" : undefined}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-charcoal"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
      {strengthMeter && value && (
        <div id="password-strength" className="mt-3 space-y-2" aria-live="polite">
          <div className="flex gap-1 h-1" role="progressbar" aria-valuenow={strengthMeter.strength} aria-valuemin={0} aria-valuemax={5}>
            {[1,2,3,4,5].map((i) => <div key={i} className={`flex-1 rounded-full ${i <= strengthMeter.strength ? strengthMeter.colors[strengthMeter.strength] : "bg-cream-dark"}`} />)}
          </div>
          <p className="text-xs text-stone">{strengthMeter.labels[strengthMeter.strength]}</p>
        </div>
      )}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div role="alert" className="p-3 bg-terracotta/10 border border-terracotta/20 rounded-lg text-terracotta text-sm">
      {message}
    </div>
  );
}

export function Divider() {
  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cream-dark" /></div>
      <div className="relative flex justify-center"><span className="bg-cream px-3 text-xs text-stone">or</span></div>
    </div>
  );
}

