/**
 * @file 引导页
 */
import React, { useCallback } from 'react';
import checkIcon from '/public/img/check.svg';
import { observer } from 'mobx-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { IonAvatar, IonBackdrop, IonButton } from '@ionic/react';

import ss from './index.module.scss';

interface TipsType {
    icon: any;
    text: string;
}

const tips: TipsType[] = [
    {
        icon: checkIcon,
        text: 'Unlock my contents',
    },
    {
        icon: checkIcon,
        text: 'Direct SMS to me',
    },
    {
        icon: checkIcon,
        text: 'Cancel subscription at any time',
    },
];

const GuidePage: React.FC = () => {
    const { t } = useTranslation();
    const store: GlobalStoreType = useStore().globalStore;
    const { showGuide, userInfo } = store;

    const handleEnter = useCallback(() => {
        store.setGlobalState('showGuide', false);
    }, []);

    const handleSubscribe = useCallback(() => {
        store.setGlobalState('showGuide', false);
        store.setGlobalState('subscribeVisible', true);
    }, []);

    if (!userInfo?.homepage_locked || !showGuide) {
        return null;
    }

    const { avatar } = userInfo;

    return (
        <div className={ss.mask}>
            <div className={ss.container}>
                <div className={ss.head}>
                    <div className={ss.userInfo}>
                        <IonAvatar className={ss.avatar}>
                            <img src={avatar} alt="" />
                        </IonAvatar>
                        <div className={ss.text}>{t('Welcome')}</div>
                    </div>
                </div>
                <div className={ss.content}>
                    <div className={ss.tipsTitle}>
                        {`${t('Welcome to subscribe my House and get these benefits')}`}:
                    </div>
                    <div className={ss.tipsList}>
                        {tips.map((item: TipsType) => {
                            return (
                                <div className={ss.tipsItem} key={item.text}>
                                    <Image src={item.icon} alt="" />
                                    <div className={ss.tipsText}>{t(item.text)}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={ss.btnGroup}>
                        <IonButton className={ss.btn} onClick={handleSubscribe}>
                            {t('OK, Subscribe now!')}
                        </IonButton>
                        <div className={ss.otherBtn} onClick={handleEnter}>
                            {t('Maybe subscribe later')}
                        </div>
                    </div>
                    <div className={ss.footer}>
                        <p>{t('Powered by')}</p>
                        <p>{t('HouseStudio')}</p>
                        <p>{t('See privacy and terms')}</p>
                    </div>
                </div>
            </div>
            <IonBackdrop />
        </div>
    );
};

export default observer(GuidePage);
