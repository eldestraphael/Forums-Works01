import axios, {
  AxiosInstance,
  AxiosInterceptorOptions,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { clearCookie, clearStorage, getSessionToken, storeData } from './localStorage';
import CookieManager from '@react-native-cookies/cookies';

import _ from 'lodash';
import { navigationRef } from '../navigation/navigator';
import { CONFIG } from '../config/config';


const url = CONFIG.api.url!
const callback = CONFIG.api.callback!
const api: AxiosInstance = axios.create({
  baseURL: url,
});

interface CsrfResponse {
  // Define the structure of the response data
  csrfToken: string;
  // Add other fields as needed
}

interface UrlResponse {
  url: string;
}
interface loginRequest {
  email: string;
  password: string
}


const requestHandler = async (config: InternalAxiosRequestConfig) => {
  const { expires } = await getSessionToken()
  const currentTime = new Date();
  const parsedDate = expires ? new Date(expires) : new Date();
  if (currentTime > parsedDate) {
    await get('auth/session')
  }
  return config;
}


const responseHandler = async (response: AxiosResponse) => {
  if ((response.config.url?.includes("callback/credentials") || response.config.url?.includes("auth/session"))) {
    if (response.data?.errors === 'Unauthorized') {
      await navigateToLogin()
    }
  }
  return response.data; // Return only the data part
}


api.interceptors.request.use(
  async config => requestHandler(config),
  error => {
    console.error('Request error:', error.response.data);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  async response => responseHandler(response),
  async error => {
    const statusCode = error.response?.status;
    if (statusCode) {
      console.error('API request failed with status code:', statusCode);
      if (statusCode === 400) {
        console.warn('Bad request:', error.response.data); // Example handling
      }
      if (statusCode === 401 && !error?.config?.url.includes('callback/credentials')) {
        await navigateToLogin()
      }
    } else {
      console.error('Unexpected error:', error);
      // Handle network issues or unexpected server errors
    }
    return Promise.reject(error);
  },
);


const navigateToLogin = async () =>{
  if (navigationRef.isReady()) {
    await clearStorage()
    await clearCookie()
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Login' }] as any,
    });
  }
}



const fetchCSRFToken = async (params: loginRequest) => {
  try {
    const csrfResponse: CsrfResponse = await api.get('auth/csrf');
    const csrfToken = csrfResponse.csrfToken;
    await storeData("csrf", csrfToken)
    const formData = new URLSearchParams();
    formData.append('email', params?.email);
    formData.append('password', params?.password);
    formData.append('redirect', 'false');
    formData.append('csrfToken', csrfToken);
    // formData.append('callbackUrl', `${url}auth/sign-in`);
    formData.append('json', 'true');

    const loginConfig: AxiosRequestConfig = {
      method: 'post',
      url: `${url}auth/callback/credentials`,
      headers: {
        'Origin': url,
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData.toString()
    };
    const loginResponse: AxiosResponse<any> = await api.request<any>(loginConfig);
    console.log(loginResponse, "loginresponse")
    return loginResponse

  } catch (err) {
    return null
  }
}

// Helper functions for each HTTP method
const get = async <T>(url: string, params?: object): Promise<T> => {
  console.log(url, "GET url")
  const response: any = await api.get<T>(url, { params });
  return response;
};

const post = async <T>(url: string, data?: object): Promise<T> => {
  console.log(url, "POST url")
  const response: any = await api.post<T>(url, data);
  return response;
};

const put = async <T>(url: string, data?: object): Promise<T> => {
  console.log(url, "PUT url")
  const response: any = await api.put<T>(url, data);
  return response;
};

const deleteReq = async <T>(url: string, data?: object): Promise<T> => {
  console.log(url, "DEL url")
  const response: any = await api.delete<T>(url, {
    data
  });
  return response;
};

export default { get, post, put, fetchCSRFToken, delete: deleteReq };
