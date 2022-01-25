/**
 * @file 会员等级组件
 */

import React, { useCallback, useEffect } from 'react';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';

import Skeleton from '@/components/Skeleton';
import { useModalVisible } from '@/hooks';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import type { SubscribeStoreType, TierListType } from '@/store/subscribeStore';
import { StepEnum, StepMap } from '@/store/subscribeStore';
import { IonButton, IonIcon } from '@ionic/react';

import ss from './index.module.scss';
const MemberShipTiers: React.FC = () => {
    const globalStore: GlobalStoreType = useStore().globalStore;
    const store: SubscribeStoreType = useStore().subscribeStore;
    const { userInfo } = globalStore;
    const { tierList } = store;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [allTier, s, h, u, toggle] = useModalVisible();

    useEffect(() => {
        if (userInfo && !tierList) {
            const { id } = userInfo;
            store.getTiers(id);
        }
    }, [userInfo]);

    const handleSubscribe = useCallback((data: TierListType) => {
        store.setValue('chooseTier', data);
        store.setValue('step', StepMap[StepEnum.memberShip]);
        globalStore.setGlobalState('subscribeVisible', true);
    }, []);

    const TierItem = useCallback(() => {
        if (!tierList) {
            return (
                <div className={ss.tierItem}>
                    <Skeleton style={{ width: '1rem', height: '0.15rem' }} />
                    <Skeleton
                        style={{ width: '1.5rem', height: '0.15rem', marginBottom: '0.3rem' }}
                    />
                    <Skeleton style={{ height: '0.15rem' }} />
                    <Skeleton style={{ height: '0.15rem', width: '2rem' }} />
                    <Skeleton style={{ height: '0.15rem', width: '1.5rem' }} />
                    <Skeleton
                        style={{ height: '0.42rem', marginTop: '0.2rem', borderRadius: 50 }}
                    />
                </div>
            );
        }
        const list = allTier ? tierList : [tierList[0]];
        return (
            <>
                {list.map((item: TierListType) => {
                    const { tier_name, tier_price } = item;
                    return (
                        <div className={ss.tierItem} key={item.tier_id}>
                            <div className={ss.name}>{tier_name}</div>
                            <div className={ss.price}>{`$${tier_price}/Month`}</div>
                            <div className={ss.desc}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mattis urna
                                non turpis magna eu duis.
                            </div>
                            <IonButton
                                mode="ios"
                                className={ss.btn}
                                onClick={() => handleSubscribe(item)}
                            >{`Join $${tier_price}/Month Tier`}</IonButton>
                        </div>
                    );
                })}
            </>
        );
    }, [allTier, tierList]);

    return (
        <div className={ss.container}>
            <div className={ss.head}>Membership Tiers</div>
            <TierItem />
            <div className={ss.footer} onClick={toggle}>
                <div className={ss.title}>Show All Tiers</div>
                <IonIcon
                    icon={allTier ? chevronUpOutline : chevronDownOutline}
                    className={ss.icon}
                />
            </div>
        </div>
    );
};

export default observer(MemberShipTiers);
