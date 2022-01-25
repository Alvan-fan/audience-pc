import React, { useCallback, useEffect, useMemo } from 'react';
import postBtn from '/public/img/postBtn.svg';
import cx from 'classnames';
import { chatboxOutline, heartOutline, shareOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import MediaPlayer from '@/components/MediaPlayer';
import Permissions from '@/components/Permissions';
import Skeleton from '@/components/Skeleton';
import { useModalVisible } from '@/hooks';
import { addStore, useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { PermissionsTypeEnum, PermissionsTypeMap } from '@/store/globalStore';
import type { ICommentType, PostStoreType } from '@/store/postStore';
import postStore from '@/store/postStore';
import { getI18nLanguage, isLogin } from '@/utils';
import { IonAvatar, IonIcon, IonInput, IonLoading, IonSpinner } from '@ionic/react';

import ss from './index.module.scss';

const Post: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { postId } = router.query;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [visible, s, h, u, toggle] = useModalVisible();
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
        store.getComment(postId as string);
    }, []);

    const i18nDate = useCallback((date: string) => {
        const dateArr = date.split('&&&');
        if (dateArr.length > 1) {
            return `${t(dateArr[0])} ${dateArr[1]}`;
        }
        return date;
    }, []);

    const handleComment = useCallback(() => {
        if (!isLogin()) {
            globalStore.setGlobalState(
                'permissionsType',
                PermissionsTypeMap[PermissionsTypeEnum.msgLogin],
            );
        }
    }, []);

    const updataComment = useCallback(async () => {
        if (commentText === '') {
            return null;
        }
        await store.updataComment(commentText, postId as string);
    }, [commentText, postId]);

    const computedData = useMemo(() => {
        if (visible || !commentData) {
            return [];
        }
        return commentData;
    }, [commentData, visible]);

    const Comments = useCallback(() => {
        if (getCommentData) {
            return (
                <div className={ss.noData}>
                    <IonSpinner name="bubbles" />
                </div>
            );
        }
        return (
            <>
                <div className={ss.commentTitle}>{t('Comments')}</div>
                {computedData.map((item: ICommentType) => {
                    const { content, user_avatar, user_name, date } = item;
                    return (
                        <div className={ss.commentItem} key={item.id}>
                            <IonAvatar className={ss.avatar}>
                                <img src={user_avatar} />
                            </IonAvatar>
                            <div>
                                <div className={cx(ss.info, ss.itemInfo)}>
                                    <div className={ss.name}>{user_name}</div>
                                    <div className={ss.date}>{i18nDate(date)}</div>
                                </div>
                                <div className={ss.commentDesc}>{content}</div>
                            </div>
                        </div>
                    );
                })}
            </>
        );
    }, [computedData, getCommentData]);

    const CreatorInfo = useCallback(() => {
        if (!postDetail || getPostData) {
            return (
                <div className={ss.user}>
                    <IonAvatar className={ss.avatar}>
                        <Skeleton />
                    </IonAvatar>
                    <div>
                        <Skeleton
                            style={{ width: '2rem', height: '0.12rem', marginBottom: '0.12rem' }}
                        />
                        <Skeleton
                            style={{ width: '3rem', height: '0.12rem', marginBottom: '0.08rem' }}
                        />
                        <Skeleton rows={2} style={{ width: '3rem', height: '0.12rem' }} />
                    </div>
                </div>
            );
        }
        const { creator_avatar, creator_name, date, play_name, play_description } = postDetail;
        return (
            <div className={ss.user}>
                <IonAvatar className={ss.avatar}>
                    <img src={creator_avatar} />
                </IonAvatar>
                <div>
                    <div className={ss.info}>
                        <div className={ss.name}>{creator_name}</div>
                        <div className={ss.date}>{i18nDate(date)}</div>
                    </div>
                    <div className={ss.title}>
                        <div>{play_name || ''}</div>
                    </div>
                    <div className={ss.desc}>{play_description || ''}</div>
                </div>
            </div>
        );
    }, [getPostData, postDetail]);

    if (!postDetail) {
        return <IonLoading isOpen={true} message={t('Please wait')} />;
    }

    const { creator_username, play_url, vote_number, comment_number } = postDetail;

    return (
        <>
            <div className={ss.container}>
                <div className={ss.preview}>
                    {getPostData ? (
                        <div className={ss.noData}>
                            <IonSpinner name="bubbles" color="light" />
                        </div>
                    ) : (
                        <MediaPlayer url={play_url} />
                    )}
                </div>
                <div className={ss.opreatContainer}>
                    <CreatorInfo />
                    <div className={ss.commentContainer}>
                        <Comments />
                    </div>
                    <div className={ss.operationBar}>
                        <div className={ss.bar}>
                            <IonIcon icon={heartOutline} className={ss.icon} />
                            {vote_number}
                            <IonIcon icon={chatboxOutline} className={ss.icon} onClick={toggle} />
                            {comment_number}
                            <IonIcon icon={shareOutline} className={ss.icon} />
                        </div>
                        <div className={ss.inputContainer}>
                            <IonInput
                                className={ss.input}
                                value={commentText}
                                placeholder={`${t('Write a comment')}...`}
                                onIonChange={(e: any) => {
                                    store.setPostState('commentText', e.detail.value || '');
                                }}
                                onIonFocus={handleComment}
                            />
                            <div className={ss.postBtn}>
                                {updateCommentBtn ? (
                                    <IonSpinner name="bubbles" />
                                ) : (
                                    <Image
                                        src={postBtn}
                                        onClick={updataComment}
                                        className={ss.btn}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Permissions creatorName={creator_username} />
        </>
        // <IonPage>
        //     <IonContent>
        //         <div className={ss.content}>
        //             <div
        //                 className={ss.postAvatar}
        //                 onClick={() => router.push(`/creator/${creator_username}`)}
        //             >
        //                 <IonAvatar className={ss.avatar}>
        //                     <img src={creator_avatar} />
        //                 </IonAvatar>
        //                 <div className={ss.avatarContent}>
        //                     <div className={ss.name}>{creator_name}</div>
        //                     <div className={ss.date}>{i18nDate(date)}</div>
        //                 </div>
        //             </div>
        //             <MediaPlayer url={play_url} />
        //             <div className={ss.opreatContainer}>
        //                 <div className={ss.title}>
        //                     <div>{play_name || ''}</div>
        //                 </div>
        //                 <div className={ss.desc}>{play_description || ''}</div>
        //                 <div className={ss.operationBar}>
        //                     <div
        //                         className={ss.comment}
        //                         onClick={() => {
        //                             console.log('like');
        //                         }}
        //                     >
        //                         <IonIcon icon={heartOutline} className={ss.icon} />
        //                         <div className={ss.number}>{vote_number}</div>
        //                         <div className={ss.text}>likes</div>
        //                     </div>
        //                     <div className={ss.comment} onClick={handleShowModal}>
        //                         <IonIcon icon={chatboxOutline} className={ss.icon} />
        //                         <div className={ss.number}>{comment_number}</div>
        //                         <div className={ss.text}>{t('Comments')}</div>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     </IonContent>
        //     <Modal
        //         visible={visible}
        //         header={<Toolbar closeIcon title={t('Comments')} onClick={hide} />}
        //         footer={
        //             <div className={ss.commentInput}>
        //                 <IonInput
        //                     className={ss.input}
        //                     value={commentText}
        //                     placeholder={`${t('Write a comment')}...`}
        //                     onIonChange={(e: any) => {
        //                         store.setPostState('commentText', e.detail.value || '');
        //                     }}
        //                     onIonFocus={handleComment}
        //                 />
        //                 {showPostBtn && (
        //                     <div className={ss.postbtn}>
        //                         {updateCommentBtn ? (
        //                             <IonSpinner name="bubbles" />
        //                         ) : (
        //                             <div onClick={updataComment}>{t('Post')}</div>
        //                         )}
        //                     </div>
        //                 )}
        //             </div>
        //         }
        //     >
        //         <Comments />
        //     </Modal>
        //     <Permissions creatorName={creator_username} />
        // </IonPage>
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
