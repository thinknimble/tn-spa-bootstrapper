import axios from "./http.client";



class DataService {


  async addTask(task) {
    return axios.post('/api/tasks/',task);
  }
  async updateTask(task) {
    return axios.patch(`api/tasks/${task.id}/`,task);
  }
  async getTasks() {
    return axios.get('/api/tasks/');
  }
  async removeTask(taskId) {
    return axios.get(`api/tasks/${taskId}/delete/`);
  }
}

export default new DataService();