import React, { useCallback } from 'react';
import PhoneInput from 'react-phone-input-2';
import { useTranslation } from 'next-i18next';

import { getCountryCode } from '@/utils';

import 'react-phone-input-2/lib/style.css';
import ss from './index.module.scss';

interface IProps {
    value: string;
    onChange: (value: string) => void;
}
const PhoneNumber: React.FC<IProps> = (props) => {
    const { value, onChange } = props;
    const { t } = useTranslation();

    const handleFilterNumber = useCallback(
        (phone: string, data: any) => {
            const countryCode = `+${data.dialCode}`;
            const filterPhone = Number(`+${phone}`.split(countryCode)[1]) || 0;
            if (filterPhone !== 0) {
                onChange(countryCode + filterPhone);
            }
        },
        [onChange],
    );

    return (
        <div className={ss.container}>
            <PhoneInput
                containerClass="phone-number-input common-input"
                country={getCountryCode()}
                placeholder={t('Enter Phone Number')}
                value={value}
                autoFormat={true}
                enableLongNumbers
                onChange={handleFilterNumber}
                // isValid={(phone: string, data: any) => {
                //     const countryCode = `+${data.dialCode}`;
                //     const filterPhone = Number(`+${phone}`.split(countryCode)[1]) || 0;
                //     return filterPhone !== 0;
                // }}
                // defaultErrorMessage={t('please check that all fields are filled out correctly')}
                inputProps={{
                    name: 'phone',
                    required: true,
                }}
            />
        </div>
    );
};

export default PhoneNumber;
