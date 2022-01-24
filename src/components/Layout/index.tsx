/**
 * @file 全局layout
 */
import React from 'react';
import { observer } from 'mobx-react';

import Header from '@/components/Header';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { IonApp, IonContent, IonToast } from '@ionic/react';

import ss from './index.module.scss';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const store: GlobalStoreType = useStore().globalStore;
    const { globalToast } = store;
    const { visible, msg, color = 'danger', duration = 2000 } = globalToast;

    return (
        <IonApp>
            <Header />
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
