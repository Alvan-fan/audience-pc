/**
 * @file 首页展示区域
 */
import React, { useCallback, useEffect } from 'react';
import cx from 'classnames';
import { chatboxOutline, heartOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';
import { useRouter } from 'next/router';

import EmptyPage from '@/components/EmptyPage';
import LockCard from '@/components/LockCard';
import Skeleton from '@/components/Skeleton';
import { addStore, useStore } from '@/store';
import type { GalleryStoreType, IPostListType } from '@/store/galleryStore';
import galleryStore from '@/store/galleryStore';
import type { GlobalStoreType } from '@/store/globalStore';
import { IonIcon, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';

import ss from './index.module.scss';

const Gallery: React.FC = () => {
    const router = useRouter();
    const store: GalleryStoreType = addStore('galleryStore', galleryStore()).galleryStore;
    const globalStore: GlobalStoreType = useStore().globalStore;
    const { postList, isLoad, loading } = store;
    const { userInfo } = globalStore;
    const { userName } = router.query;

    useEffect(() => {
        if (postList.length === 0) {
            store.getPostList(userName as string);
        }
    }, [postList.length]);

    const loadData = useCallback(async (e) => {
        await store.loadMore(userName as string, e);
        e.target.complete();
    }, []);

    const handleDetail = useCallback((data: IPostListType) => {
        const { play_visibility, play_id } = data;
        if (play_visibility === 0) {
            globalStore.setGlobalState('subscribeVisible', true);
            return;
        }
        router.push(`/post/${play_id}`);
    }, []);

    const RenderMask = useCallback(({ data }: { data: IPostListType }) => {
        const { comment_number = 0, vote_number = 0 } = data;
        return (
            <>
                <div className={ss.mask}>
                    <IonIcon icon={heartOutline} className={ss.icon} />
                    {vote_number}
                    <IonIcon icon={chatboxOutline} className={ss.icon} />
                    {comment_number}
                </div>
            </>
        );
    }, []);

    if (loading) {
        return (
            <div className={ss.skeletonContainer}>
                <Skeleton rows={9} style={{ width: '100%', height: '2.5rem', margin: 0 }} />
            </div>
        );
    }

    if (postList.length === 0) {
        return <EmptyPage />;
    }

    if (userInfo?.homepage_locked) {
        return <LockCard />;
    }

    return (
        <>
            <div className={ss.container}>
                {postList.map((item: IPostListType) => {
                    if (item.play_url.substr(item.play_url.lastIndexOf('.')) !== '.mp4') {
                        return (
                            <div
                                className={ss.galleryContent}
                                key={item.play_id}
                                onClick={() => handleDetail(item)}
                            >
                                <div
                                    className={cx(ss.item, {
                                        [ss.lock]: item.play_visibility === 0,
                                    })}
                                >
                                    <img src={item.play_url} />
                                    {item.play_visibility === 0 && (
                                        <div className={ss.lockBtn}>Unlock Image</div>
                                    )}
                                    <RenderMask data={item} />
                                </div>
                                {item.play_name && (
                                    <div className={ss.postTitle}>{item.play_name}</div>
                                )}
                                {item.play_description && (
                                    <div className={ss.postDesc}>{item.play_description}</div>
                                )}
                            </div>
                        );
                    }
                    return (
                        <div
                            className={ss.galleryContent}
                            key={item.play_id}
                            onClick={() => handleDetail(item)}
                        >
                            <div
                                className={cx(ss.item, {
                                    [ss.lock]: item.play_visibility === 0,
                                })}
                            >
                                <video>
                                    <source src={item.play_url} />
                                </video>
                                {item.play_visibility === 0 && (
                                    <div className={ss.lockBtn}>Unlock Video</div>
                                )}
                                <RenderMask data={item} />
                            </div>
                            {item.play_name && <div className={ss.postTitle}>{item.play_name}</div>}
                            {item.play_description && (
                                <div className={ss.postDesc}>{item.play_description}</div>
                            )}
                        </div>
                    );
                })}
            </div>
            <IonInfiniteScroll onIonInfinite={loadData} threshold="1rem" disabled={isLoad}>
                <IonInfiniteScrollContent
                    loadingSpinner="dots"
                    loadingText="Loading more data..."
                />
            </IonInfiniteScroll>
        </>
    );
};

export default observer(Gallery);
