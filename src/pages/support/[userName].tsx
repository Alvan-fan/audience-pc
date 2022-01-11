/**
 * @file 打赏页
 */
import React, { useCallback, useEffect, useState } from 'react';
import { arrowBackOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Modal from '@/components/Modal';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import StripeCardElement from '@/components/StripeCardElement';
import { useModalVisible } from '@/hooks';
import { addStore, useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import type { SupportStoreType } from '@/store/supportStore';
import supportStore from '@/store/supportStore';
import { getI18nLanguage } from '@/utils';
import {
    IonAvatar,
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonLoading,
    IonTextarea,
    useIonToast,
} from '@ionic/react';
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
    const [isPay, show, hide] = useModalVisible();
    const [result, showResult, hideResult] = useModalVisible();
    const [disable, setDisable] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const globalStore: GlobalStoreType = useStore().globalStore;
    const store: SupportStoreType = addStore('supportStore', supportStore()).supportStore;

    const { userInfo } = globalStore;
    const { amount, supportersName, remark, phoneNumber } = store;
    const { userName } = router.query;

    useEffect(() => {
        if (!userInfo) {
            globalStore.setUserInfo(userName as string);
        }
    }, [userInfo]);

    const handleSubmit = useCallback(async () => {
        if (!store.phoneNumber) {
            return present({
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
                showResult();
                hide();
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    }, [elements, stripe, supportersName]);

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
    const { name, avatar, username } = userInfo;

    return (
        <>
            <IonLoading isOpen={loading} message={t('Please wait')} />
            <div className={ss.supportHead}>
                <IonIcon
                    className={ss.rightArrow}
                    icon={arrowBackOutline}
                    onClick={() => (isPay ? hide() : router.push(`/creator/${username}`))}
                />
                <div className={ss.userContainer}>
                    <IonAvatar className={ss.avatar}>
                        <img src={avatar} alt="" />
                    </IonAvatar>
                    <div className={ss.userName}>{`${t('Support')} ${name}`}</div>
                    {isPay && (
                        <div className={ss.payTips}>{`${t('You’ll be charged')} $${amount}`}</div>
                    )}
                </div>
            </div>
            <div className={ss.supportContent}>
                {isPay ? (
                    <div className={ss.inputContainer}>
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
                ) : (
                    <>
                        <RenderGift />
                        <div className={ss.form}>
                            <div className={ss.or}>{t('OR')}</div>
                            <div className={ss.inputContainer}>
                                <IonInput
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
                                    className={ss.supprotInput}
                                    value={supportersName}
                                    placeholder={`${t('Enter your name')}...(Optional)`}
                                    onIonChange={(e) =>
                                        store.setValue('supportersName', e.detail.value || '')
                                    }
                                    clearInput
                                />
                                <IonTextarea
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
                <IonButton
                    disabled={disable}
                    onClick={() => {
                        if (isPay) {
                            return handleSubmit();
                        }
                        setDisable(true);
                        show();
                    }}
                    className={ss.btn}
                >
                    {`${t('Support')} $${amount}`}
                </IonButton>
            </div>
            <Modal visible={result} animated={false}>
                <IonContent>
                    <div className={ss.resultHead}>
                        <IonIcon icon={arrowBackOutline} onClick={hideResult} />
                    </div>
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
                        </div>
                    </div>
                </IonContent>
            </Modal>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    return {
        props: {
            ...(await serverSideTranslations(getI18nLanguage(ctx), ['common'])),
        },
    };
};

export default observer(Support);
