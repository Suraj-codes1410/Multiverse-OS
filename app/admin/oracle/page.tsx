import OracleAdminDashboardClient from './OracleAdminDashboardClient';

export const revalidate = 0;

export default async function AdminOraclePage() {
  console.log("ADMIN_DASHBOARD_LOAD");
  return <OracleAdminDashboardClient />;
}
