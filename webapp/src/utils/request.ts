import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { merge, mapValues, isError, Dictionary } from 'lodash';
import EventEmitter from '@/utils/event-emitter';

import axios from '@/utils/axios';

export enum Event {
  Error = 'error',
}

export const eventEmitter = new EventEmitter();

export interface NormalServerResponse {
  code: number;
}

export function isNormalServerResponseError(
  data: unknown
): data is NormalServerResponse {
  const { code } = data as NormalServerResponse;
  return code !== undefined && code !== 200;
}

export function isRequestError(data: unknown) {
  if (!data) {
    return false;
  }
  return isError(data) || isNormalServerResponseError(data);
}

export type RequestAPIConfig = AxiosRequestConfig & {
  emitError?: boolean;
  rawResponse?: boolean;
};

export type RequestAPIReturn = Promise<AxiosResponse<unknown>>;
export type RequestAPI = (config?: RequestAPIConfig) => RequestAPIReturn;

export function createRequestAPI(outsideConfig: RequestAPIConfig): RequestAPI {
  return function requestAPI(config): RequestAPIReturn {
    const mergedConfig = merge(
      {
        emitError: true,
      },
      outsideConfig,
      config
    );

    const { rawResponse } = mergedConfig;

    return axios.request(mergedConfig).then(
      (resp) => {
        const { data } = resp;
        if (isRequestError(data)) {
          if (mergedConfig.emitError) {
            eventEmitter.emit(Event.Error, null, data);
          }
          return Promise.reject(data);
        }
        return rawResponse ? resp : data;
      },
      (err) => {
        if (mergedConfig.emitError) {
          eventEmitter.emit(Event.Error, err);
        }
        throw err;
      }
    );
  };
}

export function createRequestAPIs<T extends Dictionary<AxiosRequestConfig>>(
  configs: T
): Record<keyof T, RequestAPI> {
  return mapValues(configs, (config) => createRequestAPI(config));
}
