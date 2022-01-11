import { request } from '@/utils/request';

interface GetSecretParmas {
    amount: number;
    phone_number: string;
    supportersName: string;
    description: string;
    creator_id: number;
}

export const getSecret = (params: GetSecretParmas) => {
    return request.post('/custom_pay', params);
};
