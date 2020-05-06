import axios, { AxiosInstance } from 'axios';

export function createInstance(): AxiosInstance {
  const baseURL = '/api';
  return axios.create({
    baseURL,
    timeout: 20000,
  });
}

const instance = createInstance();

export default instance;
