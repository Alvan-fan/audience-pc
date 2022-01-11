import { request } from '@/utils/request';

// 获取展示列表
const initParams = { visit_username: '', page: 1, pageSize: 10 };
export const getPostList = (
    params: { visit_username: string; page?: number; pageSize?: number } = initParams,
) => {
    return request.post('/get_posts', { ...initParams, ...params });
};
