/**
 * @file 登陆，注册，重置密码等权限modal
 */

import React, { useCallback, useMemo, useReducer } from 'react';
import { closeOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';
import { useTranslation } from 'next-i18next';

import Modal from '@/components/Modal';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';
import { PermissionsTypeEnum, PermissionsTypeMap } from '@/store/globalStore';
import { getRandomCode } from '@/utils';
import { IonButton, IonIcon, IonInput, IonToggle } from '@ionic/react';

import VerificationCode from '../VerificationCode';

import ss from './index.module.scss';

interface IProps {
    creatorName: string;
}
interface IState {
    phoneNumber: string;
    password: string;
}

const initState: IState = {
    phoneNumber: '',
    password: '',
};

const reducer = (state: IState, action: { type: string; value: string }) => {
    switch (action.type) {
        case 'phoneNumber':
            return { ...state, phoneNumber: action.value };
        case 'password':
            return { ...state, password: action.value };
        default:
            return { ...state };
    }
};

const TransObj: Record<string, any> = {
    [PermissionsTypeMap[PermissionsTypeEnum.none]]: {},
    [PermissionsTypeMap[PermissionsTypeEnum.login]]: {
        title: 'Login',
        desc: 'Don\'t have an account',
        other: 'Sign up',
    },
    [PermissionsTypeMap[PermissionsTypeEnum.signup]]: {
        title: 'Sign up',
        desc: 'Already have an account',
        other: 'Login',
    },
    [PermissionsTypeMap[PermissionsTypeEnum.resetpassword]]: {
        title: 'Reset Password',
        left: 'Back to',
        right: 'page',
        other: 'Login',
    },
    [PermissionsTypeMap[PermissionsTypeEnum.msgLogin]]: {
        title: 'Login',
        other: 'Send Login Link',
    },
    [PermissionsTypeMap[PermissionsTypeEnum.identityCode]]: {
        title: 'Check your phone',
    },
};

const Permissions: React.FC<IProps> = (props) => {
    const { creatorName } = props;
    const { t } = useTranslation();
    const store: GlobalStoreType = useStore().globalStore;
    const { permissionsType, loginLoading, identityCode } = store;
    const [state, dispatch] = useReducer(reducer, initState);
    const { phoneNumber, password } = state;

    const visible = useMemo(() => {
        if (permissionsType === PermissionsTypeMap[PermissionsTypeEnum.none]) {
            return false;
        }
        return true;
    }, [permissionsType]);

    const handleSubmit = useCallback(async () => {
        if (!phoneNumber) {
            store.setGlobalState('globalToast', {
                visible: true,
                msg: t('please check that all fields are filled out correctly'),
                duration: 1000,
            });
            return;
        }
        if (permissionsType === PermissionsTypeMap[PermissionsTypeEnum.msgLogin]) {
            await store.msgLogin(phoneNumber, creatorName, getRandomCode());
            dispatch({ type: 'phoneNumber', value: '' });
            store.setGlobalState('globalToast', {
                visible: true,
                msg: t('Success, please check your text messages for a confirmation link'),
                color: 'success',
                duration: 1000,
            });
        }
    }, [phoneNumber, permissionsType, creatorName]);

    return (
        <Modal className={ss.modal} visible={visible}>
            <div className={ss.container}>
                <div className={ss.loginBg} />
                <div className={ss.content}>
                    <div className={ss.closeBar}>
                        <IonIcon
                            icon={closeOutline}
                            onClick={() => {
                                store.setGlobalState(
                                    'permissionsType',
                                    PermissionsTypeMap[PermissionsTypeEnum.none],
                                );
                            }}
                            className={ss.icon}
                        />
                    </div>
                    <div className={ss.title}>{t(TransObj[permissionsType].title)}</div>
                    {(permissionsType === PermissionsTypeMap[PermissionsTypeEnum.login] ||
                        permissionsType === PermissionsTypeMap[PermissionsTypeEnum.signup]) && (
                        <div className={ss.formContainer}>
                            <PhoneNumberInput
                                defaultColor
                                onChange={(phone: string) => {
                                    dispatch({ type: 'phoneNumber', value: phone });
                                }}
                                value={phoneNumber}
                            />
                            <IonInput
                                value={password}
                                className={ss.input}
                                type="password"
                                placeholder={t('Enter Password')}
                                onIonChange={(e) => {
                                    dispatch({ type: 'password', value: e.detail.value || '' });
                                }}
                            />
                            {permissionsType === PermissionsTypeMap[PermissionsTypeEnum.login] && (
                                <div className={ss.rember}>
                                    <div className={ss.toggle}>
                                        <IonToggle
                                            checked
                                            color="primary"
                                            className={ss.toggleBtn}
                                        />
                                        <div>{t('Remember Me')}</div>
                                    </div>
                                    <div
                                        className={ss.resetPassWord}
                                        onClick={() => {
                                            store.setGlobalState(
                                                'permissionsType',
                                                PermissionsTypeMap[
                                                    PermissionsTypeEnum.resetpassword
                                                ],
                                            );
                                        }}
                                    >
                                        {t('I forgot my password')}
                                    </div>
                                </div>
                            )}
                            <IonButton disabled={loginLoading} onClick={handleSubmit}>
                                {t(TransObj[permissionsType].title)}
                            </IonButton>
                            <div>
                                <span>{t(TransObj[permissionsType].desc)}</span>
                                <span
                                    className={ss.other}
                                    onClick={() => {
                                        store.setGlobalState(
                                            'permissionsType',
                                            permissionsType ===
                                                PermissionsTypeMap[PermissionsTypeEnum.login]
                                                ? PermissionsTypeMap[PermissionsTypeEnum.signup]
                                                : PermissionsTypeMap[PermissionsTypeEnum.login],
                                        );
                                    }}
                                >
                                    {t(TransObj[permissionsType].other)}
                                </span>
                            </div>
                        </div>
                    )}
                    {permissionsType === PermissionsTypeMap[PermissionsTypeEnum.resetpassword] && (
                        <div className={ss.formContainer}>
                            <PhoneNumberInput
                                defaultColor
                                onChange={(phone: string) => {
                                    dispatch({ type: 'phoneNumber', value: phone });
                                }}
                                value={phoneNumber}
                            />
                            <IonButton onClick={handleSubmit}>
                                {t(TransObj[permissionsType].title)}
                            </IonButton>
                            <div>
                                <span>{t(TransObj[permissionsType].left)}</span>
                                <span
                                    className={ss.other}
                                    onClick={() => {
                                        store.setGlobalState(
                                            'permissionsType',
                                            PermissionsTypeMap[PermissionsTypeEnum.login],
                                        );
                                    }}
                                >
                                    {t(TransObj[permissionsType].other)}
                                </span>
                                <span>{t(TransObj[permissionsType].right)}</span>
                            </div>
                        </div>
                    )}
                    {permissionsType === PermissionsTypeMap[PermissionsTypeEnum.msgLogin] && (
                        <div className={ss.formContainer}>
                            <div className={ss.msgLoginTitle}>{t('Enter Phone Number')}</div>
                            <div className={ss.msgLoginDesc}>
                                {t('We will send you a login link via SMS')}
                            </div>
                            <PhoneNumberInput
                                defaultColor
                                onChange={(phone: string) => {
                                    dispatch({ type: 'phoneNumber', value: phone });
                                }}
                                value={phoneNumber}
                            />
                            <IonButton disabled={loginLoading} onClick={handleSubmit}>
                                {t(TransObj[permissionsType].other)}
                            </IonButton>
                        </div>
                    )}
                    {permissionsType === PermissionsTypeMap[PermissionsTypeEnum.identityCode] && (
                        <VerificationCode code={identityCode} type="login" phone={phoneNumber} />
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default observer(Permissions);
