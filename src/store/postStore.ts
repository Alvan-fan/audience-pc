import { runInAction } from 'mobx';

import { getComment, getPostDetail, updataComment, updataLike } from '@/services/postDetail';
import { commentTransForm, postTransForm } from '@/transforms/postTransForm';
import { getLocalDate, getUserInfo } from '@/utils';

export interface IPostDetailType {
    comment_number: number;
    creator_avatar: string;
    creator_id: number;
    creator_name: string;
    creator_username: string;
    date: string;
    id: number;
    like_num: number;
    like_status: number;
    play_description: string;
    play_name: string;
    play_tag: string[];
    play_thumbnail_url: string;
    play_url: string;
    play_visible: number;
    sms_count: number;
    visit_number: number;
    vote_number: number;
}

export interface ICommentType {
    content: string;
    date: string;
    id: number;
    play_id: number;
    reply_number: number;
    user_avatar: string;
    user_id: number;
    user_name: string;
    vote_number: number;
}

interface ILoadingType {
    getPostData: boolean;
    updateCommentBtn: boolean;
    getCommentData: boolean;
}

export interface PostStoreType {
    loading: ILoadingType;
    commentText: string;
    postDetail: IPostDetailType | null;
    commentData: ICommentType[] | null;
    getPostDetail: (id: string) => void;
    getComment: (id: string) => void;
    updataComment: (value: string, id: string) => void;
    setPostState: (type: string, value: boolean | string) => void;
    updataLike: (id: string) => void;
}

export default function PostStore (): PostStoreType {
    return {
        postDetail: null,
        commentData: null,
        commentText: '',
        loading: {
            getPostData: false,
            updateCommentBtn: false,
            getCommentData: false,
        },
        setPostState (type: string, value: boolean | string) {
            //@ts-ignore
            this[type] = value;
        },
        async updataLike (id: string) {
            if (!this.postDetail) {
                return;
            }
            this.postDetail.like_status = Math.abs(this.postDetail.like_status - 1);
            if (Math.abs(this.postDetail.like_status - 1) === 1) {
                this.postDetail.like_num--;
            } else {
                this.postDetail.like_num++;
            }
            await updataLike({ play_id: id });
        },
        async updataComment (value: string, id: string) {
            this.loading.updateCommentBtn = true;
            try {
                await updataComment({ play_id: id, comment_body: value });
                const { avatar = '', name = '' } = getUserInfo();
                runInAction(() => {
                    //@ts-ignore
                    this.commentData?.push({
                        content: value,
                        user_avatar: avatar,
                        date: getLocalDate(),
                        user_name: name,
                        id: Math.random(),
                    });
                    this.commentText = '';
                    this.postDetail!.comment_number = this.commentData!.length || 0;
                    this.loading.updateCommentBtn = false;
                });
            } finally {
                this.loading.updateCommentBtn = false;
            }
        },
        async getPostDetail (id: string) {
            this.loading.getPostData = true;
            const { data } = await getPostDetail({ play_id: id });
            runInAction(() => {
                this.postDetail = postTransForm(data);
                this.loading.getPostData = false;
            });
        },
        async getComment (id: string) {
            this.loading.getCommentData = true;
            const { data } = await getComment({ play_id: id });
            runInAction(() => {
                this.commentData = commentTransForm(data);
                this.loading.getCommentData = false;
            });
        },
    };
}
