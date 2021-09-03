import axios from "axios";
import store from "@/store";
function readCookie(name) {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return (match ? decodeURIComponent(match[3]) : null);
}


class ApiService {
  static session;
  static init;
  constructor() {
        
        let base_url = process.env.VUE_APP_BASE_API_URL ? process.env.VUE_APP_BASE_API_URL : `${window.location.protocol}//${window.location.hostname}`
        
        console.debug(`API Service for ${base_url}`);

        ApiService.session = axios.create({
            baseURL: base_url,
            headers: {
                'X-CSRFToken': readCookie('csrftoken'),
                "Content-type": "application/json"
            },
        });
        ApiService.session.interceptors.request.use(
          async (config) => {
            const token = store.state.auth?.user?.token || null
            if(token){
                config.headers['Authorization'] = `Token ${token}`
            }
            return config;
          },
          error => {
            Promise.reject(error)
        });
        
    }

    static get instance() {
        if (!ApiService.init) {
          new ApiService();
          ApiService.init = true;
        }
        return ApiService.session
      
    }

}

export default ApiService.instance;