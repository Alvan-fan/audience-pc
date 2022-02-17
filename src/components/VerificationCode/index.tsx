import React, { useEffect } from 'react';
import cx from 'classnames';
import { observer } from 'mobx-react';
import { useTranslation } from 'next-i18next';

// import { useModalVisible } from '@/hooks';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { PermissionsTypeEnum, PermissionsTypeMap } from '@/store/globalStore';
import { ActionTypeEnum, ActionTypeMap } from '@/store/globalStore';
import type { SubscribeStoreType } from '@/store/subscribeStore';
import { StepEnum, StepMap } from '@/store/subscribeStore';

// import { IonLoading } from '@ionic/react';
import ss from './index.module.scss';
interface IProps {
    phone: string;
    code: string;
    type: 'login' | 'subscribe';
    className?: string;
}

const VerificationCode: React.FC<IProps> = (props) => {
    const { className, type, code = '', phone = '' } = props;
    const { t } = useTranslation();
    const globalStore: GlobalStoreType = useStore().globalStore;
    const subscribeStore: SubscribeStoreType = useStore().subscribeStore;

    // const [visible, show, hide] = useModalVisible();

    useEffect(() => {
        // show();
        // 注意此处特意不依赖phone字段，使其保留，如果之后有需求需要再改此处
        const timer = setInterval(async () => {
            const data = await globalStore.isConfirmLogin(
                ActionTypeMap[ActionTypeEnum[type]],
                code,
                phone,
            );
            if (!data) {
                return;
            }
            if (type === 'login') {
                globalStore.setGlobalState(
                    'permissionsType',
                    PermissionsTypeMap[PermissionsTypeEnum.none],
                );
            }
            if (type === 'subscribe') {
                subscribeStore.setValue('step', StepMap[StepEnum.success]);
            }
            // hide();
        }, 2000);
        return () => {
            clearInterval(timer);
        };
    }, [code, type]);

    return (
        <>
            {/* <IonLoading isOpen={visible} message={t('Please wait')} /> */}
            <div className={cx(ss.container, className)}>
                <div className={ss.text}>
                    {t('Please check your SMS text message and click Confirm to continue')}
                </div>
                <div className={ss.text} style={{ marginTop: '0.3rem' }}>
                    {t(
                        'For security reasons, please make sure the one-time security code matches the code below',
                    )}
                </div>
                <div className={ss.code}>
                    {code.split('').map((item: string, idx: number) => {
                        return (
                            <div
                                className={ss.codeItem}
                                style={{ marginRight: idx === 2 ? '0.25rem' : 0 }}
                                key={idx}
                            >
                                {item}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default observer(VerificationCode);
