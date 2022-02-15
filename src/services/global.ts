import { request } from '@/utils/request';

// 获取用户信息
export const getUserInfo = (params: { visit_username: string }) => {
    return request.post('/get_profile', params);
};

// 确认订阅
export const confirmSubscribe = (params: {
    token: string;
    creator_id: number;
    tier_id: number;
}) => {
    return request.post('/confirm_subscribe', params);
};

// 短信登陆
export const msgLogin = (params: {
    phone_number: string;
    creator_username: string;
    identity_code: string;
}) => {
    return request.post('/login_link', params);
};

// 短信登陆确认
export const confirmMsgLogin = (params: { login_token: string }) => {
    return request.post('/confirm_login', params);
};

// 登陆
export const login = (params: { phone_number: string; password: string }) => {
    return request.post('/login', params);
};

// 注册
export const signup = (params: { phone_number: string; password: string }) => {
    return request.post('/register', params);
};

// 重置密码
export const resetPassWord = (params: { phone_number: string }) => {
    return request.post('/send_reset_link', params);
};

// 刷新token
export const refreshToken = () => {
    return request.post('/refresh');
};
