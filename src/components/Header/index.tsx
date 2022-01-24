import React, { useCallback } from 'react';
import logo from '/public/img/logo.svg';
import { observer } from 'mobx-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { PermissionsTypeEnum, PermissionsTypeMap } from '@/store/globalStore';
import { IonButton, IonHeader } from '@ionic/react';

import ss from './index.module.scss';

const Header: React.FC = () => {
    const { t } = useTranslation();
    const store: GlobalStoreType = useStore().globalStore;

    const handleLogin = useCallback(() => {
        store.setGlobalState('permissionsType', PermissionsTypeMap[PermissionsTypeEnum.msgLogin]);
    }, []);
    
    return (
        <div className={ss.container}>
            <IonHeader>
                <div className={ss.header}>
                    <div className={ss.headLeft}>
                        <Image src={logo} />
                        <b>House Studio</b>
                    </div>
                    <IonButton mode="ios" className={ss.headRight} onClick={handleLogin}>
                        {t('Login')}
                    </IonButton>
                </div>
            </IonHeader>
        </div>
    );
};

export default observer(Header);
