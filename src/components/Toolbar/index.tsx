import React from 'react';
import cx from 'classnames';
import { closeOutline } from 'ionicons/icons';

import { IonIcon } from '@ionic/react';

import ss from './index.module.scss';

interface IProps {
    title: string;
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
            <div className={ss.leftIcon}>
                {closeIcon && !renderLeft && (
                    <IonIcon icon={closeOutline} onClick={onClick} className={ss.icon} />
                )}
                {renderLeft}
            </div>
            <div className={ss.title}>{title}</div>
            <div className={ss.rightIcon}>{renderRight}</div>
        </div>
    );
};

export default Toolbar;
