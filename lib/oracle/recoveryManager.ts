import { queryCacheService } from './queryCache';
import { contextService } from './service';

export class OracleRecoveryManager {
  /**
   * Recovers from cache corruption or missing cache file
   */
  public static recoverCache(): void {
    try {
      const fs = eval('require')('fs');
      const path = eval('require')('path');
      const cachePath = path.join(process.cwd(), 'data/github-sync-cache.json');
      
      if (!fs.existsSync(cachePath)) {
        console.log("RECOVERY_TRIGGERED", "Cache file missing. Initializing with empty repository list.");
        fs.writeFileSync(cachePath, JSON.stringify({ repositories: [], lastUpdated: new Date().toISOString() }, null, 2));
      } else {
        const content = fs.readFileSync(cachePath, 'utf8');
        JSON.parse(content);
      }
    } catch (error) {
      console.log("RECOVERY_TRIGGERED", "Cache corruption detected. Rebuilding cache file with defaults.");
      try {
        const fs = eval('require')('fs');
        const path = eval('require')('path');
        const cachePath = path.join(process.cwd(), 'data/github-sync-cache.json');
        fs.writeFileSync(cachePath, JSON.stringify({ repositories: [], lastUpdated: new Date().toISOString() }, null, 2));
      } catch (e) {
        console.error("Failed to write default sync cache during recovery:", e);
      }
    }
  }

  /**
   * Recovers from analytics corruption or missing analytics file
   */
  public static recoverAnalytics(): void {
    try {
      const fs = eval('require')('fs');
      const path = eval('require')('path');
      const analyticsPath = path.join(process.cwd(), 'data/oracle-analytics.json');

      if (!fs.existsSync(analyticsPath)) {
        console.log("RECOVERY_TRIGGERED", "Analytics file missing. Re-creating empty analytics database.");
        fs.writeFileSync(analyticsPath, JSON.stringify({ queries: [], providerCalls: [] }, null, 2));
      } else {
        const content = fs.readFileSync(analyticsPath, 'utf8');
        JSON.parse(content);
      }
    } catch (error) {
      console.log("RECOVERY_TRIGGERED", "Analytics corruption detected. Flushing and recreating database.");
      try {
        const fs = eval('require')('fs');
        const path = eval('require')('path');
        const analyticsPath = path.join(process.cwd(), 'data/oracle-analytics.json');
        fs.writeFileSync(analyticsPath, JSON.stringify({ queries: [], providerCalls: [] }, null, 2));
      } catch (e) {
        console.error("Failed to write default analytics during recovery:", e);
      }
    }
  }

  /**
   * Safely fetches repositories, returning empty defaults if context or file loading fails
   */
  public static async getSafeRepositories(): Promise<any[]> {
    try {
      const context = await contextService.getContext();
      if (context && context.repositories) {
        return context.repositories;
      }
    } catch (error) {
      console.log("RECOVERY_TRIGGERED", "Failed to retrieve context repositories. Falling back to default list.");
    }
    return [];
  }
}
export default OracleRecoveryManager;
