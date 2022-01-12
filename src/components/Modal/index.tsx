/**
 * @file 重新封装的modal
 */
import React from 'react';
import cx from 'classnames';
import { observer } from 'mobx-react';

import { IonContent, IonFooter, IonHeader, IonModal } from '@ionic/react';

import ss from './index.module.scss';

interface IProps {
    visible: boolean;
    className?: string;
    animated?: boolean;
    onDidDismiss?: () => void;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}
const Modal: React.FC<IProps> = (props) => {
    const {
        visible,
        onDidDismiss,
        animated = true,
        className,
        header,
        footer,
        children,
        ...restProps
    } = props;
    return (
        <IonModal
            mode="ios"
            backdropDismiss={false}
            onDidDismiss={onDidDismiss}
            isOpen={visible}
            cssClass={cx(ss.modalContainer, className)}
            animated={animated}
            {...restProps}
        >
            <IonHeader>{header}</IonHeader>
            <IonContent>{children}</IonContent>
            <IonFooter>{footer}</IonFooter>
        </IonModal>
    );
};

export default observer(Modal);
