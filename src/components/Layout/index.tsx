/**
 * @file 全局layout
 */
import React from 'react';
import { observer } from 'mobx-react';

import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { IonApp, IonToast } from '@ionic/react';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const store: GlobalStoreType = useStore().globalStore;
    const { globalToast } = store;
    const { visible, msg, color = 'danger', duration = 2000 } = globalToast;
    return (
        <IonApp>
            <main>{children}</main>
            <IonToast
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
