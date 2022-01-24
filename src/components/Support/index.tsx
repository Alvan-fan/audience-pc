/**
 * @file 打赏组件
 */
import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'next-i18next';

import PhoneNumberInput from '@/components/PhoneNumberInput';
import StripeCardElement from '@/components/StripeCardElement';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import type { SupportStoreType } from '@/store/supportStore';
import { StepEnum, StepMap } from '@/store/supportStore';
import { IonAvatar, IonButton, IonInput, IonLoading, IonTextarea, useIonToast } from '@ionic/react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

import ss from './index.module.scss';

const giftMap = [
    {
        icon: '☕️',
        text: '$5',
        amount: 5,
    },
    {
        icon: '🍩',
        text: '$10',
        amount: 10,
    },
    {
        icon: '🍔',
        text: '$15',
        amount: 15,
    },
    {
        icon: '🍾',
        text: '$25',
        amount: 25,
    },
];

const Support: React.FC = () => {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [present] = useIonToast();
    const [disable, setDisable] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const globalStore: GlobalStoreType = useStore().globalStore;
    const store: SupportStoreType = useStore().supportStore;

    const { userInfo } = globalStore;
    const { step, amount, supportersName, remark, phoneNumber } = store;

    const handleSubmit = useCallback(async () => {
        if (step === StepMap[StepEnum.support]) {
            setDisable(true);
            return store.setValue('step', StepMap[StepEnum.pay]);
        }
        if (!store.phoneNumber) {
            return present({
                mode: 'ios',
                message: t('please check that all fields are filled out correctly'),
                duration: 1000,
                color: 'danger',
            });
        }
        setLoading(true);
        const params = { ...store, creatorID: userInfo?.id || 0 };
        try {
            const secret = await store.submit(params);
            if (secret as unknown as string) {
                if (!stripe || !elements) {
                    throw new Error('stripe has not been initialized.');
                }
                const data = await stripe.confirmCardPayment(secret as unknown as string, {
                    payment_method: {
                        //@ts-ignore
                        card: elements.getElement(CardElement) as any,
                        billing_details: {
                            name: supportersName,
                        },
                    },
                });
                if (data.error) {
                    present({
                        message: data.error.message,
                        duration: 1500,
                        color: 'danger',
                    });
                    throw new Error('stripe confirm faild!');
                }
                store.setValue('step', StepMap[StepEnum.success]);
            }
        } finally {
            setLoading(false);
        }
    }, [step, supportersName, userInfo?.id]);

    const RenderGift = useCallback(() => {
        return (
            <div className={ss.giftContainer}>
                {giftMap.map((item) => (
                    <div
                        className={ss.giftItem}
                        key={item.amount}
                        style={{ borderColor: amount === item.amount ? '#605DEC' : '' }}
                        onClick={() => store.setValue('amount', Number(item.amount) || 0)}
                    >
                        <span>{item.icon}</span>
                        <span className={ss.giftPrice}>{item.text}</span>
                    </div>
                ))}
            </div>
        );
    }, [amount]);

    if (!userInfo) {
        return null;
    }
    const { name, avatar } = userInfo;

    return (
        <div className={ss.container}>
            <IonLoading isOpen={loading} message={t('Please wait')} />
            <div className={ss.supportHead}>{`${t('Support')} ${name}`}</div>
            <div className={ss.supportContent}>
                {step === StepMap[StepEnum.support] && (
                    <>
                        <RenderGift />
                        <div className={ss.form}>
                            <div className={ss.or}>{t('OR')}</div>
                            <div className={ss.inputContainer}>
                                <IonInput
                                    mode="ios"
                                    className={ss.supprotInput}
                                    type="number"
                                    value={amount}
                                    placeholder={`${t('Enter amount')} ($)`}
                                    onIonChange={(e) =>
                                        store.setValue('amount', Number(e.detail.value) || 0)
                                    }
                                    clearInput
                                />
                                <IonInput
                                    mode="ios"
                                    className={ss.supprotInput}
                                    value={supportersName}
                                    placeholder={`${t('Enter your name')}...(Optional)`}
                                    onIonChange={(e) =>
                                        store.setValue('supportersName', e.detail.value || '')
                                    }
                                    clearInput
                                />
                                <IonTextarea
                                    mode="ios"
                                    className={ss.supprotInput}
                                    placeholder={`${t('Write something nice')}...(Optional)`}
                                    clearOnEdit={true}
                                    rows={4}
                                    value={remark}
                                    onIonChange={(e) =>
                                        store.setValue('remark', e.detail.value || '')
                                    }
                                />
                            </div>
                        </div>
                    </>
                )}
                {step === StepMap[StepEnum.pay] && (
                    <div className={ss.inputContainer}>
                        <div className={ss.userContainer}>
                            <IonAvatar className={ss.avatar}>
                                <img src={avatar} alt="" />
                            </IonAvatar>
                            <div className={ss.userName}>{`${t('Support')} ${name}`}</div>
                            <div className={ss.payTips}>{`${t(
                                'You’ll be charged',
                            )} $${amount}`}</div>
                        </div>
                        <PhoneNumberInput
                            value={phoneNumber}
                            onChange={(phone: string) => {
                                store.setValue('phoneNumber', phone);
                            }}
                        />
                        <StripeCardElement
                            onReady={() => {
                                setDisable(false);
                            }}
                        />
                    </div>
                )}
                {step === StepMap[StepEnum.success] && (
                    <>
                        <div className={ss.resultContent}>
                            <div className={ss.resultDesc}>
                                <span role="img" aria-label="" className={ss.resultIcon}>
                                    🙏🏻
                                </span>
                                <div className={ss.resultTitle}>
                                    {`${t('Thank you for supporting')} ${name}`}
                                </div>
                                <div className={ss.resultInfo}>
                                    {`${t('You have sent')} $${amount}${t('to')}${name}${t(
                                        'successfully.And we will send you an email receipt shortly',
                                    )}`}
                                </div>
                                <div
                                    className={ss.backBtn}
                                    onClick={() => {
                                        store.setValue('step', StepMap[StepEnum.support]);
                                    }}
                                >
                                    OK!
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {step !== StepMap[StepEnum.success] && (
                    <IonButton
                        mode="ios"
                        disabled={disable}
                        onClick={handleSubmit}
                        className={ss.btn}
                    >
                        {`${t('Support')} $${amount}`}
                    </IonButton>
                )}
            </div>
        </div>
    );
};

export default observer(Support);
