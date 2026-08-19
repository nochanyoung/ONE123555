import type { EligibilityProfile, ListingInput } from "./types";

const LISTING_KEY = "housing-benefit:listing";
const PROFILE_KEY = "housing-benefit:profile";

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function saveListing(listing: ListingInput): void {
  writeJSON(LISTING_KEY, listing);
}

export function loadListing(): ListingInput | null {
  return readJSON<ListingInput>(LISTING_KEY);
}

export function saveProfile(profile: EligibilityProfile): void {
  writeJSON(PROFILE_KEY, profile);
}

export function loadProfile(): EligibilityProfile | null {
  return readJSON<EligibilityProfile>(PROFILE_KEY);
}
