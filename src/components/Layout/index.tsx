/**
 * @file 全局layout
 */
import React from 'react';
import logo from '/public/img/logo.svg';
import { observer } from 'mobx-react';
import Image from 'next/image';

import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { IonApp, IonContent, IonHeader, IonToast } from '@ionic/react';

import ss from './index.module.scss';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const store: GlobalStoreType = useStore().globalStore;
    const { globalToast } = store;
    const { visible, msg, color = 'danger', duration = 2000 } = globalToast;

    return (
        <IonApp>
            <IonHeader>
                <div className={ss.header}>
                    <div className={ss.headLeft}>
                        <Image src={logo} />
                        <b>House Studio</b>
                    </div>
                    <div className={ss.headRight}>Create on House Studio</div>
                </div>
            </IonHeader>
            <IonContent className={ss.main}>{children}</IonContent>
            <IonToast
                mode="ios"
                isOpen={visible}
                message={msg}
                color={color}
                duration={duration}
                onDidDismiss={() => {
                    store.setGlobalState('globalToast', {
                        visible: false,
                        msg: '',
                        color: 'danger',
                        duration: 2000,
                    });
                }}
            />
        </IonApp>
    );
};
export default observer(Layout);
