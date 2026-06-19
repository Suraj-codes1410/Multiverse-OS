import { EnvironmentValidator } from './environmentValidator';
import { OracleRecoveryManager } from './recoveryManager';

let initialized = false;

export function initializeOracleStartup() {
  if (initialized) return;
  initialized = true;

  // 1. Run environment validation checks
  EnvironmentValidator.validate();

  // 2. Resolve cache or analytics corruptions
  OracleRecoveryManager.recoverCache();
  OracleRecoveryManager.recoverAnalytics();

  console.log("SERVICES_INITIALIZED");
}
export default initializeOracleStartup;
