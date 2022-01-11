import { getSecret } from '@/services/support';

interface SubmitParams {
    amount: number;
    phoneNumber: string;
    supportersName: string;
    remark: string;
    creatorID: number;
}
export interface SupportStoreType {
    amount: number;
    supportersName: string;
    remark: string;
    phoneNumber: string;
    setValue: (key: string, value: number | string) => void;
    submit: (params: SubmitParams) => void;
}

export default function supportStore (): SupportStoreType {
    return {
        amount: 5,
        supportersName: '',
        remark: '',
        phoneNumber: '',
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
