/**
 * @file 确认页(待废弃)
 */
import React, { useCallback } from 'react';
import { observer } from 'mobx-react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { getI18nLanguage } from '@/utils';
import { IonButton } from '@ionic/react';

import ss from './index.module.scss';

enum ConfirmType {
    login = 0,
    subscribe = 1,
}

const ConfirmTypeMap = {
    [ConfirmType.login]: 'login',
    [ConfirmType.subscribe]: 'subscribe',
};

const ConfirmPage: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const store: GlobalStoreType = useStore().globalStore;
    const { routeName } = router.query;
    console.log(router.query);

    const handleSubmit = useCallback(async () => {
        if (routeName === ConfirmTypeMap[ConfirmType.login]) {
            const { token, creator } = router.query;
            await store.confirmMsgLogin(token as string);
            router.replace(`/creator/${creator}`);
        }
        if (routeName === ConfirmTypeMap[ConfirmType.subscribe]) {
            const { token, creator_id = 0, tier_id = 0 } = router.query;
            const { creator_username = '' } = await store.confirmSubscribe(
                token as string,
                +creator_id,
                +tier_id,
            );
            router.replace(`/creator/${creator_username}`);
        }
    }, [routeName]);

    const RenderContent = useCallback(() => {
        if (routeName === ConfirmTypeMap[ConfirmType.login]) {
            const { creator } = router.query;
            return (
                <IonButton className={ss.btn} onClick={handleSubmit}>
                    {`${'Back to'} ${creator} ${t('s House')}`}
                </IonButton>
            );
        }
        if (routeName === ConfirmTypeMap[ConfirmType.subscribe]) {
            return (
                <IonButton className={ss.btn} onClick={handleSubmit}>
                    {t('Confirm')}
                </IonButton>
            );
        }
        return null;
    }, [routeName]);

    return (
        <div className={ss.container}>
            <div className={ss.title}>{t('Confirm Login')}</div>
            <div className={ss.content}>
                <RenderContent />
            </div>
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

export default observer(ConfirmPage);
