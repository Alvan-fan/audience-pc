/**
 * @file 订阅相关
 */

import React, { useCallback, useState } from 'react';
import confetti from '/public/img/confetti.png';
import cx from 'classnames';
import dayjs from 'dayjs';
import { chevronBackOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import ApplePay from '@/components/ApplePay';
import Modal from '@/components/Modal';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import StripeCardElement from '@/components/StripeCardElement';
import TierList from '@/components/TierList';
import Toolbar from '@/components/Toolbar';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import type { SubscribeStoreType } from '@/store/subscribeStore';
import { StepEnum, StepMap } from '@/store/subscribeStore';
import { getRandomCode } from '@/utils';
import { logEvent } from '@/utils/analytics';
import { IonAvatar, IonButton, IonIcon, IonLoading, useIonToast } from '@ionic/react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

import VerificationCode from '../VerificationCode';

import ss from './index.module.scss';

const Subscribe: React.FC = () => {
    const { t } = useTranslation();
    const [present] = useIonToast();
    const stripe = useStripe();
    const elements = useElements();
    const globalStore: GlobalStoreType = useStore().globalStore;
    const store: SubscribeStoreType = useStore().subscribeStore;
    const { subscribeVisible, userInfo } = globalStore;
    const { step, phoneNumber, chooseTier, subscribeLoading, identityCode } = store;
    const [disableBtn, setDisableBtn] = useState<boolean>(true);

    // 如果以后首页的tier列表和订阅里面的不一致的时候需要
    // useEffect(() => {
    //     if (userInfo && step === StepMap[StepEnum.tier]) {
    //         const { id } = userInfo;
    //         store.getTiers(id);
    //     }
    // }, [step, userInfo]);

    const toggleModal = useCallback(() => {
        globalStore.setGlobalState('subscribeVisible', !subscribeVisible);
    }, [subscribeVisible]);

    const handleDidDismiss = useCallback(() => {
        store.setValue('step', StepMap[StepEnum.phone]);
        store.setValue('phoneNumber', '');
        store.setValue('chooseTier', null);
        setDisableBtn(true);
    }, []);

    const handleNextStep = useCallback(() => {
        if (!phoneNumber) {
            return present({
                color: 'danger',
                message: t('please check that all fields are filled out correctly'),
                duration: 1000,
                mode: 'ios',
            });
        }
        store.setValue('step', StepMap[StepEnum.tier]);
    }, [phoneNumber]);

    const stripePay = useCallback(
        async (customer_id: string) => {
            if (!chooseTier || !userInfo) {
                return;
            }
            if (!stripe || !elements) {
                return present({
                    mode: 'ios',
                    message: 'stripe has not been initialized.',
                    duration: 1000,
                    color: 'danger',
                });
            }
            try {
                const stripeResult = await stripe.createPaymentMethod({
                    type: 'card',
                    //@ts-ignore
                    card: elements.getElement(CardElement),
                });
                if (stripeResult.error) {
                    return present({
                        mode: 'ios',
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
            } finally {
                store.setValue('subscribeLoading', false);
            }
            store.setValue('step', StepMap[StepEnum.success]);
        },
        [chooseTier, phoneNumber, userInfo],
    );

    const handleSubscribePay = useCallback(async () => {
        if (!chooseTier || !userInfo) {
            return;
        }
        store.setValue('subscribeLoading', true);
        // 如果本地存在customerID直接去stripe创建
        const customerId = localStorage.getItem('customerId');
        if (customerId) {
            return stripePay(customerId);
        }
        logEvent('subscribe pay', 'click pay subscribe');
        try {
            const { data } = await store.signup(phoneNumber);
            const { customer_id } = data;
            localStorage.setItem('customerId', customer_id);
            stripePay(customer_id);
        } finally {
            store.setValue('subscribeLoading', false);
        }
    }, [chooseTier, phoneNumber, userInfo]);

    const handleSubscribeFree = useCallback(async () => {
        if (!chooseTier || !userInfo) {
            return;
        }
        store.setValue('subscribeLoading', true);
        logEvent('subscribe free', 'click free subscribe');
        const { tier_id } = chooseTier;
        const { id } = userInfo;
        store.subscribeFreeTier(phoneNumber, tier_id, id, getRandomCode());
    }, [chooseTier, phoneNumber, userInfo]);

    const handlePrevStep = useCallback(() => {
        if (step === StepMap[StepEnum.tier]) {
            return store.setValue('step', StepMap[StepEnum.phone]);
        }
        if (step === StepMap[StepEnum.pay]) {
            setDisableBtn(true);
            return store.setValue('step', StepMap[StepEnum.tier]);
        }
    }, [step]);

    const handleSubscribe = useCallback(() => {
        if (!chooseTier) {
            return null;
        }
        const { tier_price } = chooseTier;
        if (!phoneNumber) {
            return present({
                color: 'danger',
                message: t('please check that all fields are filled out correctly'),
                duration: 1000,
                mode: 'ios',
            });
        }
        if (tier_price === '0.00') {
            return handleSubscribeFree();
        }
        handleSubscribePay();
    }, [chooseTier, handleSubscribePay, phoneNumber]);

    const RenderFooter = useCallback(() => {
        switch (step) {
            case StepMap[StepEnum.phone]:
                return (
                    <div className={ss.footer}>
                        <IonButton className={ss.nextBtn} onClick={handleNextStep}>
                            {t('Next')}
                        </IonButton>
                    </div>
                );
            case StepMap[StepEnum.tier]:
                return (
                    <div className={cx(ss.footer, ss.backFooter)}>
                        <IonIcon icon={chevronBackOutline} className={ss.icon} />
                        <div onClick={handlePrevStep} className={ss.backBtn}>
                            Back
                        </div>
                    </div>
                );
            case StepMap[StepEnum.pay]:
                return (
                    <div className={cx(ss.footer, ss.payFooter)}>
                        <div className={ss.backFooter}>
                            <IonIcon icon={chevronBackOutline} className={ss.icon} />
                            <div onClick={handlePrevStep} className={ss.backBtn}>
                                Back
                            </div>
                        </div>
                        <IonButton
                            disabled={disableBtn}
                            className={ss.nextBtn}
                            onClick={handleSubscribePay}
                        >
                            {t('Subscribe')}
                        </IonButton>
                    </div>
                );
            case StepMap[StepEnum.memberShip]:
                return (
                    <div className={ss.footer}>
                        <IonButton
                            disabled={chooseTier?.tier_price !== '0.00' ? disableBtn : false}
                            className={ss.nextBtn}
                            onClick={handleSubscribe}
                        >
                            {t('Subscribe')}
                        </IonButton>
                    </div>
                );
            default:
                return null;
        }
    }, [
        chooseTier,
        disableBtn,
        handleNextStep,
        handlePrevStep,
        handleSubscribe,
        handleSubscribePay,
        step,
        t,
    ]);

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
                                <div>
                                    <div className={ss.modalName}>{name}</div>
                                    <div className={ss.modalDesc}>Subscribe to My House Studio</div>
                                </div>
                            </div>
                        }
                        onClick={toggleModal}
                    />
                }
                footer={<RenderFooter />}
            >
                {step === StepMap[StepEnum.phone] && (
                    <div className={ss.content}>
                        <div className={ss.title}>Step 1/3: Enter your phone number</div>
                        <div className={ss.desc}>
                            Enter you phone number to receive exclusive posts through your SMS text
                            messages, and build a personal relationship with Nicole.
                        </div>
                        <div className={ss.label}>Phone Number</div>
                        <PhoneNumberInput
                            value={phoneNumber}
                            onChange={(value: string) => {
                                store.setValue('phoneNumber', value);
                            }}
                        />
                    </div>
                )}
                {step === StepMap[StepEnum.tier] && (
                    <div className={ss.content}>
                        <div className={ss.title}>Step 2/3: Select a membership tier</div>
                        <TierList />
                    </div>
                )}
                {step === StepMap[StepEnum.pay] && (
                    <div className={ss.content}>
                        <div className={ss.title}>Step 3/3: Complete your purchase</div>
                        <div className={ss.tierInfo}>
                            <div>{chooseTier?.tier_name}</div>
                            <div>{`$${chooseTier?.tier_price}/Month`}</div>
                        </div>
                        <div className={ss.tierTip}>Monthly Charge</div>
                        <div className={ss.tierTip}>
                            Billing Starts: {dayjs().format('YYYY-MM-DD')}
                        </div>
                        <div className={ss.totalPrice}>
                            <div>Total Today</div>
                            <div>{`$${chooseTier?.tier_price}`}</div>
                        </div>
                        <StripeCardElement
                            className={ss.cardElement}
                            onReady={() => {
                                setDisableBtn(false);
                            }}
                        />
                        <ApplePay />
                    </div>
                )}
                {step === StepMap[StepEnum.memberShip] && (
                    <div className={ss.content}>
                        <div className={ss.tierInfo} style={{ marginTop: 0 }}>
                            <div>{chooseTier?.tier_name}</div>
                            <div>{`$${chooseTier?.tier_price}/Month`}</div>
                        </div>
                        <div className={ss.tierTip}>Monthly Charge</div>
                        <div className={ss.tierTip}>
                            Billing Starts: {dayjs().format('YYYY-MM-DD')}
                        </div>
                        <div className={ss.totalPrice}>
                            <div>Total Today</div>
                            <div>{`$${chooseTier?.tier_price}`}</div>
                        </div>
                        <div className={ss.label}>Phone Number</div>
                        <PhoneNumberInput
                            value={phoneNumber}
                            onChange={(value: string) => {
                                store.setValue('phoneNumber', value);
                            }}
                        />
                        {chooseTier?.tier_price !== '0.00' && (
                            <>
                                <StripeCardElement
                                    className={cx(ss.cardElement, {
                                        [ss.memberShip]: chooseTier?.tier_price !== '0.00',
                                    })}
                                    onReady={() => {
                                        setDisableBtn(false);
                                    }}
                                />
                                <ApplePay />
                            </>
                        )}
                    </div>
                )}
                {step === StepMap[StepEnum.identityCode] && (
                    <div className={ss.content}>
                        <div className={ss.title}>Step 3/3: {t('Check your phone')}</div>
                        <VerificationCode code={identityCode} type="subscribe" className={ss.codeContainer} />
                    </div>
                )}
                {step === StepMap[StepEnum.success] && (
                    <div className={ss.successContainer}>
                        <div>
                            <Image src={confetti} />
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
