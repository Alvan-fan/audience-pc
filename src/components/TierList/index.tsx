/**
 * @file Tier 列表组件
 */
import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';

// import { useTranslation } from 'next-i18next';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import type { SubscribeStoreType, TierListType } from '@/store/subscribeStore';
import { StepEnum, StepMap } from '@/store/subscribeStore';
import { logEvent } from '@/utils/analytics';
import { IonButton, IonIcon, IonSlide, IonSlides, IonSpinner } from '@ionic/react';

import ss from './index.module.scss';

const TierList: React.FC = () => {
    // const { t } = useTranslation();
    const store: SubscribeStoreType = useStore().subscribeStore;
    const globalStore: GlobalStoreType = useStore().globalStore;
    const [swiper, setSwiper] = useState<any>({});
    const [hideSlideBar, setHideSlideBar] = useState<string>('hidePrev');
    const { userInfo } = globalStore;
    const { phoneNumber, tierList } = store;

    async function getSwiperInstance (this: any) {
        setSwiper(await this.getSwiper());
    }

    const handleSubscribeFree = useCallback(
        async (data: TierListType) => {
            if (!data || !userInfo) {
                return;
            }
            store.setValue('subscribeLoading', true);
            logEvent('subscribe free', 'click free subscribe');
            const { tier_id } = data;
            const { id } = userInfo;
            try {
                await store.subscribeFreeTier(phoneNumber, tier_id, id);
            } finally {
                store.setValue('subscribeLoading', false);
            }
            store.setValue('step', StepMap[StepEnum.success]);
        },
        [phoneNumber, userInfo],
    );

    const handleChooseTier = useCallback(
        (data: TierListType) => {
            if (data.tier_price === '0.00') {
                return handleSubscribeFree(data);
            }
            store.setValue('chooseTier', data);
            store.setValue('step', StepMap[StepEnum.pay]);
        },
        [handleSubscribeFree],
    );

    const RenderSlideBar = useCallback(() => {
        return (
            <>
                <IonIcon
                    className={cx(ss.slideBtn, ss.right, {
                        [ss.hide]: hideSlideBar === 'hideNext',
                    })}
                    icon={arrowForwardOutline}
                    onClick={() => {
                        swiper.slideNext();
                        swiper.isEnd && setHideSlideBar('hideNext');
                    }}
                />
                <div>
                    <IonIcon
                        className={cx(ss.slideBtn, ss.left, {
                            [ss.hide]: hideSlideBar === 'hidePrev',
                        })}
                        icon={arrowBackOutline}
                        onClick={() => {
                            swiper.slidePrev();
                            swiper.isBeginning && setHideSlideBar('hidePrev');
                        }}
                    />
                </div>
            </>
        );
    }, [swiper, hideSlideBar]);

    if (!tierList) {
        return (
            <div className={ss.noData}>
                <IonSpinner name="bubbles" />
            </div>
        );
    }

    return (
        <div className={ss.container}>
            <RenderSlideBar />
            <IonSlides
                onIonSlidesDidLoad={getSwiperInstance}
                options={{
                    slidesPerView: 'auto',
                }}
                className={ss.sliders}
            >
                {tierList.map((item: TierListType) => (
                    <IonSlide key={item.tier_id} className={ss.tierItem}>
                        <div className={ss.tierName}>{item.tier_name}</div>
                        <div className={ss.tierPrice}>{`$${item.tier_price}/Month`}</div>
                        <div className={ss.introduce}>
                            You will also receive a card from me and some goodies in the post, and
                            access to my research OneNote - the place I make all of my research
                            notes on ancient
                        </div>
                        <ul className={ss.tierPerks}>
                            {item.tier_perks.map((perk: string) => {
                                return (
                                    <li className={ss.tiers} key={perk}>
                                        {perk}
                                    </li>
                                );
                            })}
                        </ul>
                        <IonButton
                            className={cx(ss.tierBtn, {
                                [ss.freeBtn]: item.tier_price === '0.00',
                            })}
                            onClick={() => handleChooseTier(item)}
                        >
                            Join
                        </IonButton>
                    </IonSlide>
                ))}
            </IonSlides>
        </div>
    );
};

export default observer(TierList);
