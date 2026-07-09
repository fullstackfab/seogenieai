"use client";

import { useMemo, useState } from "react";
import { Country, State, City } from "country-state-city";

const SELECT_CLASS =
  "max-md-mobile:p-6 p-4 placeholder:opacity-80 focus:border-dark-100 focus:ring-4 focus:ring-dark-100/10 border-2 border-black/15 w-full bg-white transition-colors duration-200 rounded-[10px] text-base font-normal text-[#171717] leading-[15.96px] tracking-[0.02em]";

/**
 * Native country/state/city cascading selects backed by the `country-state-city`
 * data package — replaces the legacy `react-country-state-city` UI-kit
 * dependency (dropped for React 19 compatibility).
 */
export function LocationSelect({
  onChange,
}: {
  onChange: (loc: { country?: string; state?: string; city?: string }) => void;
}) {
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(
    () => (countryCode ? State.getStatesOfCountry(countryCode) : []),
    [countryCode]
  );
  const cities = useMemo(
    () => (countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : []),
    [countryCode, stateCode]
  );

  return (
    <div className="active-val flex gap-4 w-full max-md-mobile:flex-col justify-between max-md-mobile:gap-0">
      <div className="flex-1">
        <label htmlFor="loc-country" className="mb-3 mt-5 block">
          Country
        </label>
        <select
          id="loc-country"
          className={SELECT_CLASS}
          value={countryCode}
          onChange={(e) => {
            const code = e.target.value;
            setCountryCode(code);
            setStateCode("");
            onChange({ country: code || undefined });
          }}
        >
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="loc-state" className="mb-3 mt-5 block">
          State
        </label>
        <select
          id="loc-state"
          className={SELECT_CLASS}
          value={stateCode}
          disabled={!countryCode}
          onChange={(e) => {
            const code = e.target.value;
            setStateCode(code);
            const state = states.find((s) => s.isoCode === code);
            onChange({ state: state?.name });
          }}
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.isoCode} value={s.isoCode}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="loc-city" className="mb-3 mt-5 block">
          City
        </label>
        <select
          id="loc-city"
          className={SELECT_CLASS}
          disabled={!stateCode}
          onChange={(e) => onChange({ city: e.target.value })}
        >
          <option value="">Select City</option>
          {cities.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
