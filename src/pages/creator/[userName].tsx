/**
 * @file 作者首页
 */

import React, { useCallback, useEffect } from 'react';
import lockIcon from '/public/img/lock.svg';
import photoIcon from '/public/img/photo.svg';
import videoIcon from '/public/img/video.svg';
import { giftOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import GuideCard from '@/components/GuideCard';
import Gallery from '@/pages/gallery';
import Links from '@/pages/links';
import Permissions from '@/pages/permissions';
import Subscribe from '@/pages/subscribe';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { getI18nLanguage } from '@/utils';
import {
    IonAvatar,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonLoading,
    IonPage,
} from '@ionic/react';

import ss from './index.module.scss';

const Creator: React.FC = () => {
    const router = useRouter();
    const store: GlobalStoreType = useStore().globalStore;
    const { t } = useTranslation();
    const { userName } = router.query;
    const { userInfo } = store;

    useEffect(() => {
        if (!userInfo) {
            store.setUserInfo(userName as string);
        }
    }, [userInfo]);

    const RenderLockCard = useCallback(() => {
        if (!userInfo) {
            return null;
        }
        const { post_count, username = '', homepage_locked } = userInfo;
        const { video_post_count = 0, image_post_count = 0 } = post_count;
        if (homepage_locked) {
            return (
                <div className={ss.lockContainer}>
                    <div className={ss.lockContent}>
                        <div className={ss.lockImg}>
                            <Image src={lockIcon} />
                        </div>
                        <div className={ss.lockHead}>
                            <Image src={photoIcon} />
                            <span className={ss.resourceNumber}>{image_post_count}</span>
                            <Image src={videoIcon} />
                            <span className={ss.resourceNumber}>{video_post_count}</span>
                        </div>
                    </div>
                    <div
                        className={ss.lockBtn}
                        onClick={() => {
                            store.setGlobalState('subscribeVisible', true);
                        }}
                    >
                        {`${t('Subscribe to unlock')} ${username} ${t('’s posts')}`}
                    </div>
                </div>
            );
        }
        return <Gallery />;
    }, [userInfo]);

    if (!userInfo) {
        return <IonLoading isOpen={true} message={t('Please wait')} />;
    }

    const { avatar, bio, name, number_follower, username } = userInfo;

    return (
        <IonPage>
            <IonContent>
                <div className={ss.container}>
                    <div className={ss.userInfo}>
                        <div className={ss.head}>
                            <IonAvatar className={ss.avatar}>
                                <img src={avatar} />
                            </IonAvatar>
                            <div className={ss.userName}>{`@${username.toLowerCase()}`}</div>
                        </div>
                        <div className={ss.nickName}>{name}</div>
                        <div className={ss.follower}>
                            {number_follower} {t('Followers')}
                        </div>
                        <pre className={ss.bio}>{bio}</pre>
                        <Subscribe />
                    </div>
                    <Links />
                    <RenderLockCard />
                </div>
            </IonContent>
            <IonFab
                vertical="bottom"
                horizontal="end"
                slot="fixed"
                onClick={() => router.push(`/support/${username}`)}
            >
                <IonFabButton>
                    <IonIcon icon={giftOutline} />
                </IonFabButton>
            </IonFab>
            <Permissions creatorName={username} />
            <GuideCard />
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

export default observer(Creator);
