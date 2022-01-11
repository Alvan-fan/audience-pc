import { runInAction } from 'mobx';

import { getPostList } from '@/services/gallery';
import { galleryTransForm } from '@/transforms/galleryTransForm';

export interface IPostListType {
    comment_number: number;
    date: string;
    play_description: string;
    play_id: number;
    play_name: string;
    play_tag: [];
    play_thumbnail_url: string;
    play_url: string;
    play_visibility: number;
    save_number: number;
    share_id: string;
    visible_tier_id: number[];
    visit_number: number;
    vote_number: number;
}

export interface GalleryStoreType {
    postList: IPostListType[];
    isLoad: boolean;
    loading: boolean;
    page: number;
    getPostList: (userName: string) => void;
    loadMore: (userName: string, e: any) => void;
}

export default function galleryStore (): GalleryStoreType {
    return {
        postList: [],
        isLoad: false,
        loading: false,
        page: 1,
        async getPostList (userName: string) {
            this.loading = true;
            const { data } = await getPostList({ visit_username: userName });
            runInAction(() => {
                this.postList = galleryTransForm(data);
                this.loading = false;
            });
        },
        async loadMore (userName: string) {
            const { data } = await getPostList({
                visit_username: userName,
                page: ++this.page,
            });
            runInAction(() => {
                this.postList = [...this.postList, ...galleryTransForm(data)];
                if (data.length === 0) {
                    this.isLoad = true;
                }
            });
        },
    };
}
