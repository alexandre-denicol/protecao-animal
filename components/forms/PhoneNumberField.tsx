'use client'

import {
  PHONE_COUNTRIES,
  type PhoneCountry,
  formatPhoneInput,
} from '@/lib/whatsapp'
import Field from './Field'

export default function PhoneNumberField({
  label,
  name,
  countryName,
  required,
  value,
  country,
  error,
  onValueChange,
  onCountryChange,
}: {
  label: string
  name: string
  countryName: string
  required?: boolean
  value: string
  country: PhoneCountry
  error?: string
  onValueChange: (value: string) => void
  onCountryChange: (country: PhoneCountry) => void
}) {
  const placeholder =
    PHONE_COUNTRIES.find((option) => option.code === country)?.placeholder ??
    'Número com DDD'

  return (
    <Field label={label} required={required} hint="Informe o número com DDD." error={error}>
      {(control) => (
        <div
          className={`mt-2 overflow-hidden rounded-[var(--radius-button)] border bg-[rgba(255,255,255,0.03)] transition focus-within:ring-2 focus-within:ring-[rgba(244,184,96,0.35)] ${
            error ? 'border-salmon-400 bg-[rgba(127,29,29,0.18)]' : 'border-white/35'
          }`}
        >
          <div className="flex flex-col sm:flex-row">
            <select
              name={countryName}
              aria-label="Código do país"
              value={country}
              onChange={(event) => {
                const nextCountry = event.target.value as PhoneCountry
                onCountryChange(nextCountry)
                onValueChange(formatPhoneInput(value, nextCountry))
              }}
              className="min-w-0 border-b border-white/20 bg-transparent px-3 py-3 text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-0 sm:w-44 sm:border-b-0 sm:border-r"
            >
              {PHONE_COUNTRIES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              {...control}
              name={name}
              type="tel"
              inputMode="tel"
              value={value}
              onChange={(event) =>
                onValueChange(formatPhoneInput(event.target.value, country))
              }
              placeholder={placeholder}
              className="w-full border-0 bg-transparent px-3 py-3 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-0"
              autoComplete="tel-national"
            />
          </div>
        </div>
      )}
    </Field>
  )
}
