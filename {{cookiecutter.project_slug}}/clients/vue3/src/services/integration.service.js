import axios from "./http.client";


class IntegrationService {

  async getDBSchemas() {
    return axios.get('/api/organizations/get-db-schemas/');
  }
  async getIntegratedServices() {
    return axios.get('/api/organizations/integrations/');
  }
  async addSFIntegration(org_id) {
    return axios.post(`/api/organizations/${org_id}/integrations/`,{name:"salesforce",status:"on",organization:org_id,auth_type:"bearer"});
  }
  async getOrganizationSFUsers() {
    return axios.get('/api/organizations/sf-users/');
  }
  async getOrganizationSFContacts() {
    return axios.get('/api/organizations/sf-contacts/');
  }
  async getOrganizationSFCompanies() {
    return axios.get('/api/organizations/sf-companies/');
  }
  async getOrganizationSFUsersWithCompanies() {
    return axios.get('/api/organizations/sf-users-and-companies/');
  }
  async getTableSchemas(table) {
    return axios.post('/api/organizations/get-table-schema/',{table:table});
  }
  async getTablesSchemas(tables) {
    return axios.post('/api/organizations/get-tables-schema/',{tables:tables});
  }
  async startDBSync(tables) {
    return axios.post('/api/organizations/create-and-import-schema/',{tables:tables});
  }

  async getSyncStatus() {
    return axios.get('/api/organizations/get-sync-status/');
  }
  async getOrganizationSources(org_id) {
    return axios.get(`/api/organizations/${org_id}/sources/get-nested-sources/`);
  }
  async addOrganizationMetric(org_id,metric) {
    return axios.post(`/api/organizations/${org_id}/metrics/`,metric);
  }
  async getOrganizationMetrics(org_id) {
    return axios.get(`/api/organizations/${org_id}/metrics/`);
  }
  async deleteOrganizationMetric(org_id,metric_id) {
    return axios.delete(`/api/organizations/${org_id}/metrics/${metric_id}/`);
  }
  async updateOrganizationMetric(org_id,metric) {
    return axios.patch(`/api/organizations/${org_id}/metrics/${metric.id}/`,metric);
  }


}

export default new IntegrationService();