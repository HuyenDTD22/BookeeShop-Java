import httpClient from "../../utils/httpClient";
import { API_ENDPOINTS } from "../../constants";

const dashboardService = {
  getSummary: async () => {
    const response = await httpClient.get(
      API_ENDPOINTS.ADMIN.DASHBOARD_SUMMARY,
    );
    return response.data;
  },
  getAnalytics: async () => {
    const response = await httpClient.get(
      API_ENDPOINTS.ADMIN.DASHBOARD_ANALYTICS,
    );
    return response.data;
  },
};

export default dashboardService;
