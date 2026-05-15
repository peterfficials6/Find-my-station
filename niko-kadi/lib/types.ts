export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "flagged";

export type IdentityType = "named" | "nicknamed" | "anonymous";

export interface NavigationLinks {
  google_maps: string;
  waze: string;
  apple_maps: string;
  uber: string;
  geo: string;
}

export interface ConstituencyListItem {
  slug: string;
  name: string;
  county: string;
  county_slug: string;
  status: string;
  confirmations: number;
  has_coordinates: boolean;
}

export interface StatsResponse {
  total_constituencies: number;
  verified: number;
  pending: number;
  unverified: number;
  flagged: number;
  total_contributions: number;
  total_contributors: number;
  verification_percentage: number;
}

export interface ContributeRequest {
  constituency_id: string;
  lat: number;
  lng: number;
  display_name?: string;
  identity_type?: IdentityType;
  device_fingerprint: string;
}

export interface ContributeResponse {
  id: string;
  cluster_id: string;
  cluster_count: number;
  message: string;
}
