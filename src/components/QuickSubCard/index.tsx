/**
 * @file 快速订阅卡片组件
 */

import React, { useCallback } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'next-i18next';

import PhoneNumberInput from '@/components/PhoneNumberInput';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import type { SubscribeStoreType } from '@/store/subscribeStore';
import { StepEnum, StepMap } from '@/store/subscribeStore';
import { IonButton } from '@ionic/react';

import ss from './index.module.scss';

const QuickSubCard: React.FC = () => {
    const { t } = useTranslation();
    const globalStore: GlobalStoreType = useStore().globalStore;
    const store: SubscribeStoreType = useStore().subscribeStore;
    const { phoneNumber } = store;
    const { subscribeVisible } = globalStore;

    const toggleModal = useCallback(() => {
        store.setValue('step', StepMap[StepEnum.tier]);
        globalStore.setGlobalState('subscribeVisible', !subscribeVisible);
    }, [subscribeVisible]);

    return (
        <div className={ss.container}>
            <div className={ss.title}>Subscribe My HouseStudio</div>
            <div className={ss.desc}>
                Subscribe to Nicole via House to receive exclusive posts right in your inbox, and
                build a personal relationship
            </div>
            <div className={ss.operatContainer}>
                <div className={ss.inputContainer}>
                    <PhoneNumberInput
                        inputClass={ss.input}
                        value={phoneNumber}
                        onChange={(value: string) => {
                            store.setValue('phoneNumber', value);
                        }}
                    />
                </div>
                <IonButton mode="ios" className={ss.btn} onClick={toggleModal}>
                    {t('Subscribe')}
                </IonButton>
            </div>
        </div>
    );
};

export default observer(QuickSubCard);
