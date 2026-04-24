export function getGoogleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function getAppleMapsSearchUrl(address: string): string {
  return `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
}
