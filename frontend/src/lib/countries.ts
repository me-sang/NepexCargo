export type Country = { code: string; name: string };

// Bootstrap list used before /countries resolves and as a fallback when the
// backend is unreachable. Codes are ISO-3166-1 alpha-2, uppercase.
export const FALLBACK_COUNTRIES: Country[] = [
  { code: "NP", name: "Nepal" },
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "CN", name: "China" },
  { code: "KR", name: "South Korea" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "AT", name: "Austria" },
  { code: "PL", name: "Poland" },
  { code: "GR", name: "Greece" },
  { code: "TR", name: "Turkey" },
  { code: "RU", name: "Russia" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "KW", name: "Kuwait" },
  { code: "BH", name: "Bahrain" },
  { code: "OM", name: "Oman" },
  { code: "IL", name: "Israel" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "LK", name: "Sri Lanka" },
  { code: "BT", name: "Bhutan" },
  { code: "MV", name: "Maldives" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "MY", name: "Malaysia" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "HK", name: "Hong Kong" },
  { code: "TW", name: "Taiwan" },
  { code: "NZ", name: "New Zealand" },
];

/** @deprecated Use `loadCountries()` / `useCountries()` for live data. Kept for back-compat. */
export const COUNTRIES = FALLBACK_COUNTRIES;

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 200;

type CountryDTO = { id: string; name: string; iso2: string };
type CountriesResponse = {
  success: boolean;
  data?: CountryDTO[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

let cache: Country[] | null = null;
let inflight: Promise<Country[]> | null = null;

async function fetchPage(page: number): Promise<CountriesResponse> {
  const res = await fetch(
    `${API_URL}/countries?page=${page}&limit=${PAGE_SIZE}&isActive=true`,
  );
  if (!res.ok) throw new Error(`countries ${res.status}`);
  return (await res.json()) as CountriesResponse;
}

function normalize(list: CountryDTO[]): Country[] {
  return list
    .map((c) => ({ code: c.iso2.toUpperCase(), name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchAllCountries(): Promise<Country[]> {
  const first = await fetchPage(1);
  if (!first.success || !first.data) throw new Error("bad countries response");
  const totalPages = first.meta?.totalPages ?? 1;
  if (totalPages <= 1) return normalize(first.data);
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      fetchPage(i + 2).then((r) => (r.success && r.data ? r.data : [])),
    ),
  );
  return normalize([...first.data, ...rest.flat()]);
}

export function getCountriesCache(): Country[] | null {
  return cache;
}

export function loadCountries(): Promise<Country[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetchAllCountries()
    .then((list) => {
      cache = list;
      return list;
    })
    .catch(() => {
      // ponytail: fall back to hardcoded on any error so the UI stays usable offline.
      cache = FALLBACK_COUNTRIES;
      return FALLBACK_COUNTRIES;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function countryName(code: string): string {
  const list = cache ?? FALLBACK_COUNTRIES;
  return list.find((c) => c.code === code.toUpperCase())?.name ?? code;
}
