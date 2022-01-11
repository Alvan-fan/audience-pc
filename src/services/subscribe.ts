import { TEST_DOMAIN } from '@/utils/config';
import { request } from '@/utils/request';

// 获取tier列表
export const getTiers = (params: { creator_id: number }) => {
    return request.post('/get_tiers', params);
};

// 检测手机号是否存在
export const phoneExist = (params: { phone_number: string }) => {
    return request.post('/phone_exist', params);
};

// 免费订阅
export const subscribeFreeTier = (params: {
    phone_number: string;
    free_tier_id: number;
    creator_id: number;
}) => {
    return request.post('/subscribe_free_tier', { ...params, test_domain: TEST_DOMAIN });
};

export interface CreateSubscriptionType {
    customerId: string;
    paymentMethodId: string;
    priceId: string;
    creator_id: number;
    tier_id: number;
    phone_number: string;
}
// 创建付费订阅
export const createSubscription = (params: CreateSubscriptionType) => {
    return request.post('/create_subscription', params);
};
