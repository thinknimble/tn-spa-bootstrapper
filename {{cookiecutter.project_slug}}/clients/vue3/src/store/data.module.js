import DataService from '../services/data.service';


const initialState = { tasks: [] };

export const data = {
  namespaced: true,
  state: initialState,
  actions: {
    
    
    getTasks({ commit }) {
      return DataService.getTasks().then(
        response => {
          commit('setTasks',response.data);
          return Promise.resolve(response.data);
        
        },
        error => {
          return Promise.reject(error);
        }
      );
    },
    updateTask({ commit },task) {
      return DataService.updateTask(task).then(
        response => {
          commit('updateTask',response.data);
          return Promise.resolve(response.data);
        
        },
        error => {
          return Promise.reject(error);
        }
      );
    },

    addTask({ commit }, task) {
      return DataService.addTask(task).then(
        response => {
          commit('addTask',response.data);
          return Promise.resolve(response.data);
        },
        error => {
          return Promise.reject(error);
        }
      );
    },
    removeTask({ commit }, taskId) {
      return DataService.removeTask(taskId).then(
        response => {
          commit('removeTask',taskId);
          return Promise.resolve(response.data);
        },
        error => {
          return Promise.reject(error);
        }
      );
    }
    
  },
  mutations: {
   
   
    setTasks(state,tasks) {
      state.tasks = tasks;
     
    },
    addTask(state,task) {
      state.tasks.push(task);
     
    },
    updateTask(state,task) {
      var index = state.tasks.map(function(task) { return task.id; }).indexOf(task.id);
      state.tasks.splice(index, 1,task);
    },
    removeTask(state,taskId) {
      var removeIndex = state.tasks.map(function(task) { return task.id; }).indexOf(taskId);
      state.tasks.splice(removeIndex, 1);
    }
  }
};