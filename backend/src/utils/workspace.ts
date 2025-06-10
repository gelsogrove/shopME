/**
 * Workspace utilities
 * Note: No default workspace fallback should be used to prevent cross-workspace contamination
 */

/**
 * Returns null instead of a hardcoded workspace ID to force proper error handling
 * This prevents cross-workspace contamination that was happening with the previous fallback
 */
export function getDefaultWorkspaceId(): null {
  // Return null to force proper workspace handling
  // This prevents the previous issue where all requests would fallback to a hardcoded workspace
  return null;
} 