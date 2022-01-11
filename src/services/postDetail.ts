import { request } from '@/utils/request';

// 获取post详情
export const getPostDetail = (params: { play_id: string }) => {
    return request.post('/get_post', params);
};

// 获取评论
export const getComment = (params: { play_id: string }) => {
    return request.post('/get_comments', params);
};

// 更新评论
export const updataComment = (params: { play_id: string; comment_body: string }) => {
    return request.post('/post_comment', params);
};
