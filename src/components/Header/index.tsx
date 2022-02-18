/**
 * @file header组件
 */

import React, { useCallback, useMemo } from 'react';
import logo from '/public/img/logo.svg';
import { observer } from 'mobx-react';
import Image from 'next/image';
import router from 'next/router';
import { useTranslation } from 'next-i18next';

import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { PermissionsTypeEnum, PermissionsTypeMap } from '@/store/globalStore';
import type { SubscribeStoreType } from '@/store/subscribeStore';
import { cookie, getUserInfo, isLogin } from '@/utils';
import { IonAvatar, IonButton, IonHeader } from '@ionic/react';

import ss from './index.module.scss';

const Header: React.FC = () => {
    const { t } = useTranslation();
    const store: GlobalStoreType = useStore().globalStore;
    const subscribeStore: SubscribeStoreType = useStore().subscribeStore;

    const handleLoginOut = useCallback(() => {
        cookie.remove('ACCESS_TOKEN');
        cookie.remove('REFRESH_TOKEN');
        cookie.remove('EXPIRED_TIME');
        localStorage.removeItem('userInfo');
        router.reload();
    }, [subscribeStore]);

    const menus = useMemo(
        () => [
            {
                title: 'Logout',
                fn: handleLoginOut,
            },
        ],
        [handleLoginOut],
    );

    const handleLogin = useCallback(() => {
        store.setGlobalState('permissionsType', PermissionsTypeMap[PermissionsTypeEnum.msgLogin]);
    }, []);

    const RenderLoginBar = useCallback(() => {
        if (isLogin()) {
            const { name = '', avatar = '' } = getUserInfo();
            return (
                <div className={ss.loginContainer}>
                    <div className={ss.userInfo}>
                        <IonAvatar className={ss.avatar}>
                            <img src={avatar} />
                        </IonAvatar>
                        <div className={ss.name}>{name}</div>
                    </div>
                    <ul className={ss.popover}>
                        {menus.map((item) => {
                            return (
                                <li className={ss.popoverItem} key={item.title} onClick={item.fn}>
                                    {t(item.title)}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }
        return (
            <IonButton mode="ios" className={ss.headRight} onClick={handleLogin}>
                {t('Login')}
            </IonButton>
        );
    }, []);

    return (
        <div className={ss.container}>
            <IonHeader>
                <div className={ss.header}>
                    <div className={ss.headLeft}>
                        <Image src={logo} />
                        <b>House Studio</b>
                    </div>
                    <RenderLoginBar />
                </div>
            </IonHeader>
        </div>
    );
};

export default observer(Header);
