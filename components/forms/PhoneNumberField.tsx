'use client'

import {
  PHONE_COUNTRIES,
  type PhoneCountry,
  formatPhoneInput,
} from '@/lib/whatsapp'

function inputClass(hasError?: boolean) {
  return `w-full border-0 bg-transparent px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-0 ${
    hasError ? 'bg-salmon-50' : 'bg-white'
  }`
}

export default function PhoneNumberField({
  id,
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
  id: string
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
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-neutral-700">
        {label}
        {required && <span className="text-salmon-500"> *</span>}
      </label>

      <div
        className={`mt-1 overflow-hidden rounded-xl border focus-within:ring-2 focus-within:ring-primary-100 ${
          error ? 'border-salmon-400 bg-salmon-50' : 'border-neutral-200 bg-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row">
        <select
          name={countryName}
          value={country}
          onChange={(event) => {
            const nextCountry = event.target.value as PhoneCountry
            onCountryChange(nextCountry)
            onValueChange(formatPhoneInput(value, nextCountry))
          }}
          className={`min-w-0 border-b border-neutral-200 bg-transparent px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-0 sm:w-44 sm:border-b-0 sm:border-r ${
            error ? 'bg-salmon-50' : 'bg-transparent'
          }`}
        >
          {PHONE_COUNTRIES.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          required={required}
          value={value}
          onChange={(event) =>
            onValueChange(formatPhoneInput(event.target.value, country))
          }
          placeholder={placeholder}
          className={inputClass(Boolean(error))}
          autoComplete="tel-national"
        />
        </div>
      </div>

      {error ? (
        <p className="mt-1 text-xs text-salmon-600">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-neutral-400">
          Informe o número com DDD.
        </p>
      )}
    </div>
  )
}
