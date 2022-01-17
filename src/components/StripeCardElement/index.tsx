/**
 * @file 重新封装的stripe支付组件
 */

import React from 'react';
import cx from 'classnames';

import { CardElement } from '@stripe/react-stripe-js';

import ss from './index.module.scss';

interface IProps {
    onReady?: () => void;
    className?: string;
}

const StripeCardElement: React.FC<IProps> = (props) => {
    const { onReady = () => {}, className } = props;
    return (
        <div className={cx(ss.container, className)}>
            <CardElement
                options={{
                    style: {
                        base: {
                            fontSize: '15px',
                            color: '#424770',
                            letterSpacing: '0.025em',
                            fontFamily: 'Source Code Pro, monospace',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }}
                onReady={onReady}
                //   onChange={(event) => {
                //     console.log('CardElement [change]', event);
                //   }}
                //   onBlur={() => {
                //     console.log('CardElement [blur]');
                //   }}
                //   onFocus={() => {
                //     console.log('CardElement [focus]');
                //   }}
            />
        </div>
    );
};

export default StripeCardElement;
