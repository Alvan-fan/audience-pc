import type { ICommentType, IPostDetailType } from '@/store/postStore';
import { getLocalDate } from '@/utils';

export const postTransForm = (data: IPostDetailType) => {
    return { ...data, date: getLocalDate(data.date) };
};

export const commentTransForm = (data: ICommentType[]) => {
    return data.map((item: ICommentType) => {
        return { ...item, date: getLocalDate(item.date) };
    });
};
