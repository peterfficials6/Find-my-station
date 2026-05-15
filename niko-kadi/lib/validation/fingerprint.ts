/**
 * Validate a device fingerprint.
 * Expects a hexadecimal string of 32 to 64 characters.
 */
export function isValidFingerprint(fingerprint: string): boolean {
  if (typeof fingerprint !== "string") {
    return false;
  }

  // Must be a hex string between 32 and 64 characters
  const hexPattern = /^[a-f0-9]{32,64}$/i;
  return hexPattern.test(fingerprint);
}
