
import { BASE_URL } from "./Api/Constant";;
const axios = require("axios");

let isRefreshing = false;
let refreshQueue = [];



const request = async function (options) {
  const onSuccess = function (response) {
    return response.data;
  };

  const onError = async function (error) {
    const originalRequest = error.config;
    // const navigate = useNavigate();

    if (error.response) {
      const status = error.response.status;

      console.error("Status:", status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
      return Promise.reject(error.response.data);
    } else {
      console.error("Error Message:", error.message);
      return Promise.reject(error.message);
    }
  };

  const client = axios.create({
    baseURL: BASE_URL,
  });

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("bidshushi_tokens");
      if (token) {
        config.headers["Authorization"] = `bearer ${
          JSON.parse(localStorage.getItem("bidshushi_tokens"))?.access?.token
        }`;
      }

      config.headers["Content-Type"] = "application/json";
      return config;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      // block to handle success case
      return response;
    },
    function (error) {
      // block to handle error case
      const originalRequest = error.config;

      if (
        error.response.status === 401 &&
        originalRequest.url === `${BASE_URL}/auth/refresh-tokens`
      ) {
        // Added this condition to avoid infinite loop
        // Redirect to any unauthorised route to avoid infinite loop...
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalRequest._retry) {
        if (!isRefreshing) {
     
          isRefreshing = true;
          const refreshToken = JSON.parse(localStorage.getItem("bidshushi_tokens"))?.refresh?.token;

          return axios
            .post(`${BASE_URL}/auth/refresh-tokens`, {
              refreshToken: refreshToken,
            })
            .then((res) => {
              localStorage.setItem("bidshushi_tokens", JSON.stringify(res.data));
                  // Update the Authorization header with the new access token
                  client.defaults.headers['Authorization'] = 'Bearer ' + res.data?.access?.token;
  
                  // Retry the original request with the updated headers
                  originalRequest.headers['Authorization'] = 'Bearer ' + res.data?.access?.token;
              // process all queued requests
              refreshQueue.forEach((cb) => cb(null, res.data.access.token));
              refreshQueue = [];
              isRefreshing = false;
              return axios(originalRequest);
            })
            .catch((error) => {
              // process all queued requests
              
              if(error&&error.message==='Request failed with status code 401'||!localStorage.getItem("bidshushi_tokens")?.refresh?.token){
               localStorage.clear();
               if(window.location.search){
               window.location.assign(`/login?location=${window.location.pathname.slice(1)}${window.location.search}`)
               }else{
                window.location.assign('/login')
               }
              }
             
              refreshQueue.forEach((cb) => cb(error, null));
              refreshQueue = [];
              isRefreshing = false;
              return Promise.reject(error);
            });
        } else {
          // add the request callback to the queue
          return new Promise((resolve, reject) => {
            refreshQueue.push((err, token) => {
              if (err) {
                reject(err);
              } else {

                client.defaults.headers['Authorization'] = 'Bearer' + token;
                 // Retry the original request with the updated headers
                 originalRequest.headers['Authorization'] = 'Bearer ' + token;
                 setTimeout(() => {
                  resolve(axios(originalRequest));
                }, 1000);
              }
            });
          });
        }
      }
      return Promise.reject(error);
    }
  );

  return client(options).then(onSuccess).catch(onError);
};

export default request;