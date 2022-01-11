import type { TierListType } from '@/store/subscribeStore';

export const transformTierList = (data: TierListType[]) => {
    return data.map((item: TierListType) => {
        return { ...item, tier_price: (+item.tier_price / 100).toFixed(2) };
    });
};
