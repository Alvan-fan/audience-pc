/**
 * @file 请求封装
 */

import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

import { refreshToken } from '@/services/global';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { PermissionsTypeEnum, PermissionsTypeMap } from '@/store/globalStore';
import { cookie, getToken, isExpired } from '@/utils';
import { BASE_URL } from '@/utils/config';
interface ServiceResponse {
    code: number;
    msg: string;
    data: any;
}

type ServiceErrorHandler = (response: ServiceResponse) => void;

// http错误信息
const codeMessage: Record<number, string> = {
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};

// 业务错误
export class CodeError extends Error {
    private code: number;

    constructor (code: number, messages: string) {
        super(messages);
        this.code = code;
    }
}

// axios实例
export const request = axios.create({
    // 设置baseUr地址,如果通过proxy跨域可直接填写base地址
    baseURL: BASE_URL,
    // 定义统一的请求头部
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
    },
    // 配置请求超时时间
    timeout: 10000,
    // 如果用的JSONP，可以配置此参数带上cookie凭证，如果是代理和CORS不用设置
    // withCredentials: true,
});

const serviceErrorHandler = (
    response: ServiceResponse,
    store: GlobalStoreType,
    handler?: ServiceErrorHandler,
) => {
    const { code = 0, msg = '' } = response;

    if (code === 0) {
        return response;
    }

    // 暂时使用msg重定向到登陆页
    if (code === 1 && msg === 'Already subscribed') {
        store.setGlobalState('globalToast', { visible: true, msg });
        store.setGlobalState('permissionsType', PermissionsTypeMap[PermissionsTypeEnum.msgLogin]);
        return Promise.reject(msg);
    }

    if (handler) {
        handler(response);
        return Promise.reject(msg);
    }
    store.setGlobalState('globalToast', { visible: true, msg });
    return Promise.reject(msg);
};

let _retry = false;
// 请求拦截
request.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        const store: GlobalStoreType = useStore().globalStore;
        return new Promise((resolve) => {
            const newConfig = { ...config };
            const { url = '' } = newConfig;
            if (isExpired() && !_retry) {
                _retry = true;
                refreshToken()
                    .then((res: any) => {
                        cookie.set('ACCESS_TOKEN', res.data.access_token);
                        cookie.set('REFRESH_TOKEN', res.data.refresh_token);
                        cookie.set('EXPIRED_TIME', new Date().getTime());
                        if (newConfig.headers) {
                            newConfig.headers.Authorization = res.data.access_token;
                        }
                    })
                    .catch(() => {
                        store.setGlobalState('permissionsType', 'login');
                    })
                    .finally(() => {
                        resolve(newConfig);
                    });
            } else {
                if (newConfig.headers) {
                    newConfig.headers.Authorization = getToken(url);
                }
                resolve(newConfig);
            }
        });
    },
    (error) => {
        Promise.reject(error);
    },
);

// 返回拦截
request.interceptors.response.use(
    (response) => {
        const store: GlobalStoreType = useStore().globalStore;
        const { data } = response;
        return serviceErrorHandler(data, store);
    },
    (error) => {
        const { status, data } = error.response;
        if (status !== 200) {
            const store: GlobalStoreType = useStore().globalStore;
            const errorText = data.msg || codeMessage[status];
            store.setGlobalState('globalToast', { visible: true, msg: errorText });
            return errorText;
        }
    },
);
