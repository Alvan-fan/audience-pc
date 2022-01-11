import type { IPostListType } from '@/store/galleryStore';

// post排序
export const sortPost = (arr: any) => {
    if (!arr) {
        return [];
    }
    if (arr.length <= 1) {
        return arr;
    }
    const left = [];
    const right = [];
    for (let i = 0; i < arr.length; i++) {
        if (i % 2 === 0) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }
    return [...left, ...right];
};

export const galleryTransForm = (data: IPostListType[]) => {
    return sortPost(data);
};
