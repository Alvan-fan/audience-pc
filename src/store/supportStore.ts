import { getSecret } from '@/services/support';

interface SubmitParams {
    amount: number;
    phoneNumber: string;
    supportersName: string;
    remark: string;
    creatorID: number;
}

export enum StepEnum {
    support = 0,
    pay = 1,
    success = 2,
}

export const StepMap = {
    [StepEnum.support]: 'support',
    [StepEnum.pay]: 'pay',
    [StepEnum.success]: 'success',
};
export interface SupportStoreType {
    amount: number;
    supportersName: string;
    remark: string;
    phoneNumber: string;
    step: string;
    setValue: (key: string, value: number | string) => void;
    submit: (params: SubmitParams) => void;
}

export default function supportStore (): SupportStoreType {
    return {
        amount: 5,
        supportersName: '',
        remark: '',
        phoneNumber: '',
        step: StepMap[StepEnum.support],
        setValue (key, value) {
            //@ts-ignore
            this[key] = value;
        },
        async submit (params) {
            const { amount, supportersName, phoneNumber, remark, creatorID } = params;
            const { data } = await getSecret({
                amount: amount * 100,
                phone_number: phoneNumber,
                description: remark,
                creator_id: creatorID,
                supportersName,
            });
            return data.paymentintent_client_secret || '';
        },
    };
}
