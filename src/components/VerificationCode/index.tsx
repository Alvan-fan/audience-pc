import React, { useEffect } from 'react';
import cx from 'classnames';
import { useTranslation } from 'next-i18next';

import ss from './index.module.scss';
interface IProps {
    code: string;
    type: 'login' | 'subscribe';
    className?: string;
}
const VerificationCode: React.FC<IProps> = (props) => {
    const { code = '', className, type } = props;
    const { t } = useTranslation();
    useEffect(() => {
        const timer = setInterval(() => {
            console.log('轮询接口');
        }, 2000);
        return () => {
            clearInterval(timer);
        };
    }, []);
    console.log(type);

    return (
        <div className={cx(ss.container, className)}>
            <div className={ss.text}>
                {t('Please check your SMS text message and click Confirm to continue')}
            </div>
            <div className={ss.text} style={{ marginTop: '0.3rem' }}>
                {t(
                    'For security reasons, please make sure the one-time security code matches the code below',
                )}
            </div>
            <div className={ss.code}>
                {code.split('').map((item: string, idx: number) => {
                    return (
                        <div
                            className={ss.codeItem}
                            style={{ marginRight: idx === 2 ? '0.25rem' : 0 }}
                            key={idx}
                        >
                            {item}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VerificationCode;
