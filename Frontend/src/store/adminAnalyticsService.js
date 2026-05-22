import axios from 'axios';

const API_BASE =
  import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';

axios.defaults.withCredentials = true;

/**
 * Super admin ledger summary: platform share, top venues, monthly platform revenue.
 */
export async function fetchAdminEarningsSummary() {
  const { data } = await axios.get(`${API_BASE}/api/admin/earnings-summary`);
  return data;
}
