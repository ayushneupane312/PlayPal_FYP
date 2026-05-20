import axios from 'axios';

import API_BASE from '../utils/apiBase';

axios.defaults.withCredentials = true;

/**
 * Super admin ledger summary: platform share, top venues, monthly platform revenue.
 */
export async function fetchAdminEarningsSummary() {
  const { data } = await axios.get(`${API_BASE}/api/admin/earnings-summary`);
  return data;
}
