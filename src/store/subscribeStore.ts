import md5 from 'md5';
import { runInAction } from 'mobx';

import { signup } from '@/services/global';
import type { CreateSubscriptionType } from '@/services/subscribe';
import { createSubscription, getTiers, subscribeFreeTier } from '@/services/subscribe';
import { transformTierList } from '@/transforms/subscribeForm';

export interface TierListType {
    create_date: string;
    creator_id: number;
    price_id: string;
    product_id: string;
    tier_id: number;
    tier_name: string;
    tier_perks: string[];
    tier_price: number | string;
}

export enum StepEnum {
    phone = 0,
    tier = 1,
    success = 2,
}

export const StepMap = {
    [StepEnum.phone]: 'phone',
    [StepEnum.tier]: 'tier',
    [StepEnum.success]: 'success',
};

export interface SubscribeStoreType {
    tierList: TierListType[] | null;
    phoneNumber: string;
    step: string;
    subscribeLoading: boolean;
    chooseTier: TierListType | null;
    setValue: (key: string, value: number | string | boolean | TierListType | null) => void;
    getTiers: (creatorId: number) => void;
    subscribeFreeTier: (phoneNumber: string, tierId: number, creatorId: number) => void;
    signup: (phoneNumber: string) => any;
    createSubscription: (params: CreateSubscriptionType) => void;
}

export default function subscribeStore (): SubscribeStoreType {
    return {
        phoneNumber: '',
        step: StepMap[StepEnum.phone],
        tierList: null,
        chooseTier: null,
        subscribeLoading: false,
        setValue (key, value) {
            //@ts-ignore
            this[key] = value;
        },
        async getTiers (creatorId: number) {
            const { data } = await getTiers({ creator_id: creatorId });
            runInAction(() => {
                this.tierList = transformTierList(data);
            });
        },
        async subscribeFreeTier (phoneNumber: string, tierId: number, creatorId: number) {
            this.subscribeLoading = true;
            try {
                await subscribeFreeTier({
                    phone_number: phoneNumber,
                    free_tier_id: tierId,
                    creator_id: creatorId,
                });
            } finally {
                this.subscribeLoading = false;
            }
        },
        async signup (phoneNumber: string) {
            return await signup({
                phone_number: phoneNumber,
                password: md5(phoneNumber),
            });
        },
        async createSubscription (params: CreateSubscriptionType) {
            return await createSubscription({ ...params });
        },
    };
}
