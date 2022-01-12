/**
 * @file 订阅相关
 */

import React, { useCallback, useEffect, useState } from 'react';
import checkIcon from '/public/img/check.svg';
import cx from 'classnames';
import { radioButtonOffOutline, radioButtonOnOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import ApplePay from '@/components/ApplePay';
import Modal from '@/components/Modal';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import StripeCardElement from '@/components/StripeCardElement';
import Toolbar from '@/components/Toolbar';
import { addStore, useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { PermissionsTypeEnum, PermissionsTypeMap } from '@/store/globalStore';
import type { SubscribeStoreType, TierListType } from '@/store/subscribeStore';
import subscribeStore from '@/store/subscribeStore';
import { StepEnum, StepMap } from '@/store/subscribeStore';
import { logEvent } from '@/utils/analytics';
import { IonAvatar, IonButton, IonIcon, IonLoading, IonSpinner, useIonToast } from '@ionic/react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

import ss from './index.module.scss';

const Subscribe: React.FC = () => {
    const { t } = useTranslation();
    const [present] = useIonToast();
    const stripe = useStripe();
    const elements = useElements();
    const globalStore: GlobalStoreType = useStore().globalStore;
    const store: SubscribeStoreType = addStore('subscribeStore', subscribeStore()).subscribeStore;
    const { subscribeVisible, userInfo } = globalStore;
    const { step, phoneNumber, tierList, chooseTier, subscribeLoading } = store;
    const [disableBtn, setDisableBtn] = useState<boolean>(true);

    useEffect(() => {
        if (userInfo && step === StepMap[StepEnum.tier]) {
            const { id } = userInfo;
            store.getTiers(id);
        }
    }, [step, userInfo]);

    const toggleModal = useCallback(() => {
        globalStore.setGlobalState('subscribeVisible', !subscribeVisible);
    }, [subscribeVisible]);

    const handleDidDismiss = useCallback(() => {
        store.setValue('step', StepMap[StepEnum.phone]);
        store.setValue('phoneNumber', '');
        store.setValue('chooseTier', null);
    }, []);

    const handleNextStep = useCallback(() => {
        if (!phoneNumber) {
            return present({
                color: 'danger',
                message: t('please check that all fields are filled out correctly'),
                duration: 1000,
            });
        }
        store.setValue('step', StepMap[StepEnum.tier]);
    }, [phoneNumber]);

    const handleChooseTier = useCallback((data: TierListType) => {
        store.setValue('chooseTier', data);
        if (data.tier_price === 0) {
            setDisableBtn(true);
        }
    }, []);

    const stripePay = useCallback(
        async (customer_id: string) => {
            if (!chooseTier || !userInfo) {
                return;
            }
            if (!stripe || !elements) {
                return present({
                    message: 'stripe has not been initialized.',
                    duration: 1000,
                    color: 'danger',
                });
            }
            const stripeResult = await stripe.createPaymentMethod({
                type: 'card',
                //@ts-ignore
                card: elements.getElement(CardElement),
            });
            if (stripeResult.error) {
                return present({
                    message: stripeResult.error.message,
                    duration: 1000,
                    color: 'danger',
                });
            }
            const { price_id, tier_id } = chooseTier;
            const { id } = userInfo;
            await store.createSubscription({
                customerId: customer_id,
                paymentMethodId: stripeResult.paymentMethod.id,
                priceId: price_id,
                creator_id: id,
                tier_id,
                phone_number: phoneNumber,
            });
        },
        [chooseTier, phoneNumber, userInfo],
    );

    const handleSubscribeFree = useCallback(async () => {
        if (!chooseTier || !userInfo) {
            return;
        }
        logEvent('subscribe free', 'click free subscribe');
        const { tier_id } = chooseTier;
        const { id } = userInfo;
        await store.subscribeFreeTier(phoneNumber, tier_id, id);
        store.setValue('step', StepMap[StepEnum.success]);
    }, [chooseTier, phoneNumber, userInfo]);

    const handleSubscribePay = useCallback(async () => {
        if (!chooseTier || !userInfo) {
            return;
        }
        // 如果本地存在customerID直接去stripe创建
        const customerId = localStorage.getItem('customerId');
        if (customerId) {
            return stripePay(customerId);
        }
        logEvent('subscribe pay', 'click pay subscribe');
        store.setValue('subscribeLoading', true);
        try {
            const { data } = await store.signup(phoneNumber);
            const { customer_id } = data;
            localStorage.setItem('customerId', customer_id);
            stripePay(customer_id);
        } finally {
            store.setValue('subscribeLoading', false);
        }
    }, [chooseTier, phoneNumber, userInfo]);

    const RenderTierItem = useCallback(() => {
        if (!tierList) {
            return (
                <div className={ss.noData}>
                    <IonSpinner name="bubbles" />
                </div>
            );
        }
        return (
            <>
                {tierList.map((item: TierListType) => (
                    <div
                        className={ss.tierItem}
                        key={item.tier_id}
                        onClick={() => {
                            handleChooseTier(item);
                        }}
                    >
                        <div className={ss.tierDetail}>
                            <div className={ss.tierName}>{item.tier_name}</div>
                            <div className={ss.tierPrice}>{`$${item.tier_price}/Month`}</div>
                            <div className={ss.tierList}>
                                {item.tier_perks.map((perk: string) => {
                                    return (
                                        <div className={ss.tiers} key={perk}>
                                            <Image src={checkIcon} className={ss.checkIcon} />
                                            <div className={ss.tierDesc}>{perk}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className={ss.icon}>
                            {item.tier_id === chooseTier?.tier_id ? (
                                <IonIcon
                                    style={{ color: '#605DEC' }}
                                    slot="icon-only"
                                    icon={radioButtonOnOutline}
                                />
                            ) : (
                                <IonIcon slot="icon-only" icon={radioButtonOffOutline} />
                            )}
                        </div>
                    </div>
                ))}
            </>
        );
    }, [chooseTier?.tier_id, handleChooseTier, tierList]);

    const RenderPayBtn = useCallback(() => {
        if (!chooseTier) {
            return <div className={ss.selectTierText}>{t('Please Select a Tier')}</div>;
        }
        if (chooseTier.tier_price === 0) {
            return (
                <IonButton className={cx(ss.btn, ss.subscribeBtn)} onClick={handleSubscribeFree}>
                    {t('Subscribe')}
                </IonButton>
            );
        }
        return (
            <IonButton
                className={cx(ss.btn, ss.subscribeBtn)}
                disabled={disableBtn}
                onClick={handleSubscribePay}
            >
                {t('Checkout and Subscribe')}
            </IonButton>
        );
    }, [chooseTier, disableBtn]);

    if (!userInfo) {
        return null;
    }

    const { name, username, avatar } = userInfo;

    return (
        <div className={ss.container}>
            <IonLoading isOpen={subscribeLoading} message={t('Please wait')} />
            <IonButton mode="ios" className={ss.btn} onClick={toggleModal}>
                {t('Subscribe')}
            </IonButton>
            <Modal
                onDidDismiss={handleDidDismiss}
                visible={subscribeVisible}
                header={
                    <Toolbar
                        closeIcon
                        renderLeft={
                            <div className={ss.modalHead}>
                                <IonAvatar className={ss.avatar}>
                                    <img src={avatar} />
                                </IonAvatar>
                                <div className={ss.info}>
                                    <div className={ss.name}>{name}</div>
                                    <div className={ss.modalDesc}>Subscribe to My House Studio</div>
                                </div>
                            </div>
                        }
                        onClick={toggleModal}
                    />
                }
            >
                {step === StepMap[StepEnum.phone] && (
                    <div className={ss.content}>
                        <div className={ss.title}>{`${t('Subscribe to')} ${name}`}</div>
                        <div className={ss.desc}>
                            {t(
                                'House let\'s you follow your favorite creators in a personalized fashion with only your phone number',
                            )}
                        </div>
                        <PhoneNumberInput
                            value={phoneNumber}
                            onChange={(value: string) => {
                                store.setValue('phoneNumber', value);
                            }}
                        />
                        <IonButton className={ss.nextBtn} onClick={handleNextStep}>
                            {t('Next')}
                        </IonButton>
                        <div className={ss.quickLogin}>
                            <div className={ss.tip}>{t('Already signed up and subscribed?')}</div>
                            <div
                                className={ss.loginBtn}
                                onClick={() => {
                                    globalStore.setGlobalState(
                                        'permissionsType',
                                        PermissionsTypeMap[PermissionsTypeEnum.msgLogin],
                                    );
                                }}
                            >
                                {t('Login')}
                            </div>
                        </div>
                    </div>
                )}
                {step === StepMap[StepEnum.tier] && (
                    <div className={ss.tierContainer}>
                        <div className={ss.title}>{t('Choose Membership Tier')}</div>
                        <div className={ss.desc}>
                            {t('Each membership tier allows you to subscribe to different perks')}
                        </div>
                        <div className={ss.tierOutContainer}>
                            <div className={ss.tierContent}>
                                <RenderTierItem />
                            </div>
                        </div>
                        <div className={ss.payBtnGroup}>
                            {chooseTier !== null && chooseTier.tier_price !== 0 && (
                                <StripeCardElement
                                    className={ss.cardElement}
                                    onReady={() => {
                                        setDisableBtn(false);
                                    }}
                                />
                            )}
                            <RenderPayBtn />
                            <ApplePay />
                        </div>
                        <div className={ss.footerContainer}>
                            <div className={ss.footer}>
                                <div>{t('By registering you agree to our Terms')} </div>
                                <div>{t('of Use, our Privacy Policy and our')}</div>
                                <div>{t('Information collection notice')}</div>
                            </div>
                            <div className={ss.otherOptions}>{t('Other Payment Options')}</div>
                        </div>
                    </div>
                )}
                {step === StepMap[StepEnum.success] && (
                    <div className={ss.successContainer}>
                        <div>
                            <div className={ss.fontIcon}>🎉</div>
                            <div className={ss.title}>
                                {`${t('Thank you for subscribing to')} ${username}${t(
                                    '\'s House',
                                )}!`}
                            </div>
                            <div className={ss.desc}>
                                <div>{t('You have successfully subscribed')}</div>
                                <div>{`${username} ${t('will keep you updated via your')}`}</div>
                                <div>{`${t('Phone Number')} ${phoneNumber}`}</div>
                            </div>
                            <div className={ss.backLink} onClick={toggleModal}>
                                {`${t('Back to')} ${username} ${t('\'s page')}`}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default observer(Subscribe);
