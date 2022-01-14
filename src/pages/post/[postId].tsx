import React, { useCallback, useEffect } from 'react';
import { arrowBackOutline, chatboxOutline, heartOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import MediaPlayer from '@/components/MediaPlayer';
import Modal from '@/components/Modal';
import Permissions from '@/components/permissions';
import Skeleton from '@/components/Skeleton';
import Toolbar from '@/components/Toolbar';
import { useModalVisible } from '@/hooks';
import { addStore, useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { PermissionsTypeEnum, PermissionsTypeMap } from '@/store/globalStore';
import type { ICommentType, PostStoreType } from '@/store/postStore';
import postStore from '@/store/postStore';
import { getI18nLanguage, isLogin } from '@/utils';
import { IonAvatar, IonContent, IonIcon, IonInput, IonPage, IonSpinner } from '@ionic/react';

import ss from './index.module.scss';

const Post: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { postId } = router.query;
    const [visible, show, hide] = useModalVisible();
    const [showPostBtn, showBtn, hideBtn] = useModalVisible();
    const store: PostStoreType = addStore('postStore', postStore()).postStore;
    const globalStore: GlobalStoreType = useStore().globalStore;
    const {
        postDetail,
        commentData,
        loading: { getCommentData, getPostData, updateCommentBtn },
        commentText,
    } = store;

    useEffect(() => {
        store.getPostDetail(postId as string);
    }, []);

    const i18nDate = useCallback((date: string) => {
        const dateArr = date.split('&&&');
        if (dateArr.length > 1) {
            return `${t(dateArr[0])} ${dateArr[1]}`;
        }
        return date;
    }, []);

    const handleShowModal = useCallback(() => {
        show();
        store.getComment(postId as string);
    }, []);

    const handleComment = useCallback(() => {
        if (!isLogin()) {
            globalStore.setGlobalState(
                'permissionsType',
                PermissionsTypeMap[PermissionsTypeEnum.msgLogin],
            );
        }
        showBtn();
    }, []);

    const updataComment = useCallback(async () => {
        if (commentText === '') {
            return null;
        }
        await store.updataComment(commentText, postId as string);
        hideBtn();
    }, [commentText, postId]);

    const Comments = useCallback(() => {
        if (getCommentData || !commentData) {
            return (
                <div className={ss.noData}>
                    <IonSpinner name="bubbles" />
                </div>
            );
        }
        return (
            <div className={ss.commentContainer}>
                {commentData.map((item: ICommentType) => {
                    const { content, user_avatar, user_name, date } = item;
                    return (
                        <div className={ss.commentContent} key={item.id}>
                            <IonAvatar className={ss.avatar}>
                                <img alt="loading avatar" src={user_avatar} />
                            </IonAvatar>
                            <div>
                                <div className={ss.user}>
                                    <span>{user_name}</span>
                                    <span className={ss.date}>{i18nDate(date)}</span>
                                </div>
                                <div className={ss.text}>{content} </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }, [commentData, getCommentData]);

    if (!postDetail || getPostData) {
        return (
            <>
                <Skeleton style={{ height: '0.53rem' }} />
                <div className={ss.postSkeleton}>
                    <IonAvatar slot="start" style={{ height: '0.35rem' }}>
                        <Skeleton style={{ width: '0.35rem', height: '0.35rem' }} />
                    </IonAvatar>
                    <div style={{ width: '100%' }}>
                        <Skeleton />
                        <Skeleton />
                    </div>
                </div>
                <Skeleton style={{ height: '2.8rem' }} />
                <Skeleton style={{ height: '0.25rem', marginTop: '0.18rem' }} />
            </>
        );
    }

    const {
        creator_username,
        date,
        creator_name,
        creator_avatar,
        play_url,
        play_name,
        vote_number,
        play_description,
        comment_number,
    } = postDetail;

    return (
        <IonPage>
            <Toolbar
                renderLeft={
                    <div onClick={() => router.push(`/creator/${creator_username}`)}>
                        <IonIcon className={ss.rightArrow} icon={arrowBackOutline} />
                    </div>
                }
                title={t('Post')}
            />
            <IonContent>
                <div className={ss.content}>
                    <div
                        className={ss.postAvatar}
                        onClick={() => router.push(`/creator/${creator_username}`)}
                    >
                        <IonAvatar className={ss.avatar}>
                            <img src={creator_avatar} />
                        </IonAvatar>
                        <div className={ss.avatarContent}>
                            <div className={ss.name}>{creator_name}</div>
                            <div className={ss.date}>{i18nDate(date)}</div>
                        </div>
                    </div>
                    <MediaPlayer url={play_url} />
                    <div className={ss.opreatContainer}>
                        <div className={ss.title}>
                            <div>{play_name || ''}</div>
                        </div>
                        <div className={ss.desc}>{play_description || ''}</div>
                        <div className={ss.operationBar}>
                            <div
                                className={ss.comment}
                                onClick={() => {
                                    console.log('like');
                                }}
                            >
                                <IonIcon icon={heartOutline} className={ss.icon} />
                                <div className={ss.number}>{vote_number}</div>
                                <div className={ss.text}>likes</div>
                            </div>
                            <div className={ss.comment} onClick={handleShowModal}>
                                <IonIcon icon={chatboxOutline} className={ss.icon} />
                                <div className={ss.number}>{comment_number}</div>
                                <div className={ss.text}>{t('Comments')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
            <Modal
                visible={visible}
                header={<Toolbar closeIcon title={t('Comments')} onClick={hide} />}
                footer={
                    <div className={ss.commentInput}>
                        <IonInput
                            className={ss.input}
                            value={commentText}
                            placeholder={`${t('Write a comment')}...`}
                            onIonChange={(e: any) => {
                                store.setPostState('commentText', e.detail.value || '');
                            }}
                            onIonFocus={handleComment}
                        />
                        {showPostBtn && (
                            <div className={ss.postbtn}>
                                {updateCommentBtn ? (
                                    <IonSpinner name="bubbles" />
                                ) : (
                                    <div onClick={updataComment}>{t('Post')}</div>
                                )}
                            </div>
                        )}
                    </div>
                }
            >
                <Comments />
            </Modal>
            <Permissions creatorName={creator_username} />
        </IonPage>
    );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    return {
        props: {
            ...(await serverSideTranslations(getI18nLanguage(ctx), ['common'])),
        },
    };
};

export default observer(Post);
