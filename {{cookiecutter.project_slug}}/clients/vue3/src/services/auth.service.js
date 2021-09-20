import axios from "./http.client";

class AuthService {
  async login(user) {
    return axios.post("/api/login/", {
      email: user.email,
      password: user.password,
    });
  }
  async register(data) {
    return axios.post("/api/users/",data);
  }
  async logout() {
    return axios.post("/api/logout/", {});
  }
  async recoverPassword(email) {
    return axios.post("/api/password/reset/", { email: email });
  }
  async resetPassword(uid, token, password1, password2) {
    return axios.post("/api/password/reset/confirm/", {
      uid: uid,
      token: token,
      new_password1: password1,
      new_password2: password2,
    });
  }

  async fetchMe() {
    return axios.get("/api/users/me/");
  }
  async updateUser(user_id, data) {
    return axios.patch(`/api/users/${user_id}}/`, data);
  }
}

export default new AuthService();
