/**
 * @file modal使用的header bar
 */

import React from 'react';
import cx from 'classnames';
import { closeOutline } from 'ionicons/icons';

import { IonIcon } from '@ionic/react';

import ss from './index.module.scss';

interface IProps {
    title?: string;
    closeIcon?: boolean;
    renderLeft?: React.ReactNode;
    renderRight?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}
const Toolbar: React.FC<IProps> = (props) => {
    const { closeIcon = false, renderLeft, renderRight, title, style, className, onClick } = props;
    return (
        <div style={style} className={cx(ss.container, className)}>
            <div className={ss.leftIcon}>{renderLeft}</div>
            <div className={ss.title}>{title}</div>
            <div className={ss.rightIcon}>
                {closeIcon && !renderRight && (
                    <IonIcon icon={closeOutline} onClick={onClick} className={ss.icon} />
                )}
                {renderRight}
            </div>
        </div>
    );
};

export default Toolbar;
