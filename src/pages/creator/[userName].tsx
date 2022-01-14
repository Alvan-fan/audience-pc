/**
 * @file 作者首页
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Gallery from '@/components/gallery';
import Links from '@/components/links';
import Permissions from '@/components/permissions';
import QuickSubCard from '@/components/QuickSubCard';
import Subscribe from '@/components/subscribe';
import Tabs from '@/components/Tabs';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { getI18nLanguage } from '@/utils';
import { IonAvatar } from '@ionic/react';

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

    const tabConfig = useMemo(() => {
        return [
            {
                key: '1',
                label: 'All Posts',
            },
            {
                key: '2',
                label: 'Exclusive Posts',
            },
        ];
    }, []);

    const handleChangeTab = useCallback((key: string) => {
        console.log('tab change key', key);
    }, []);

    if (!userInfo) {
        return null;
    }

    const { avatar, bio, name, number_follower, username } = userInfo;

    return (
        <div className={ss.container}>
            <div className={ss.main}>
                <div className={ss.banner}>
                    <div className={ss.mask} />
                    <div className={ss.avatarContainer}>
                        <IonAvatar className={ss.avatar}>
                            <img src={avatar} />
                        </IonAvatar>
                        <Subscribe />
                    </div>
                </div>
                <div className={ss.userInfo}>
                    <div className={ss.nameContainer}>
                        <span className={ss.nickName}>{name}</span>
                        <span className={ss.userName}>{`@${username.toLowerCase()}`}</span>
                    </div>
                    <div className={ss.follower}>
                        {number_follower} {t('Followers')}
                    </div>
                    <pre className={ss.bio}>{bio}</pre>
                </div>
                <Links />
                <div className={ss.content}>
                    <QuickSubCard />
                    <Tabs config={tabConfig} onChange={handleChangeTab} />
                    <Gallery />
                </div>
            </div>
            <div className={ss.sidebar}>123</div>
            <Permissions creatorName={username} />
        </div>
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
