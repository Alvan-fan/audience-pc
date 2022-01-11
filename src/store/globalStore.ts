import { runInAction } from 'mobx';

import {
    confirmMsgLogin,
    confirmSubscribe,
    getUserInfo,
    login,
    msgLogin,
    resetPassWord,
    signup,
} from '@/services/global';
import { transformUserInfo } from '@/transforms/globalTransForm';
import { cookie } from '@/utils';
import type { Color } from '@ionic/core';

export enum PermissionsTypeEnum {
    'none' = 0,
    'login' = 1,
    'signup' = 2,
    'resetpassword' = 3,
    'msgLogin' = 4,
}

export const PermissionsTypeMap = {
    [PermissionsTypeEnum.none]: 'none',
    [PermissionsTypeEnum.login]: 'login',
    [PermissionsTypeEnum.signup]: 'signup',
    [PermissionsTypeEnum.resetpassword]: 'resetpassword',
    [PermissionsTypeEnum.msgLogin]: 'msgLogin',
};

interface PostCountType {
    video_post_count: number;
    image_post_count: number;
    audio_post_count: number;
    text_post_count: number;
}

interface GlobalToastType {
    visible: boolean;
    msg: string;
    color?: Color;
    duration?: number;
}
export interface UserType {
    avatar: string;
    bio: string;
    creator: number;
    id: number;
    name: string;
    number_follower: number;
    number_following: number;
    social_links: string;
    username: string;
    post_count: PostCountType;
    homepage_locked: boolean;
}
export interface GlobalStoreType {
    permissionsType: string;
    showGuide: boolean;
    subscribeVisible: boolean;
    isLogin: boolean;
    userInfo: UserType | null;
    globalToast: GlobalToastType;
    confirmMsgLogin: (token: string) => void;
    confirmSubscribe: (token: string, creatorId: number, tierId: number) => any;
    setUserInfo: (userName: string) => void;
    msgLogin: (phoneNumber: string, creatorUsername: string) => any;
    login: (phoneNumber: string, password: string) => void;
    signup: (phoneNumber: string, password: string) => void;
    resetPassWord: (phoneNumber: string, password: string) => void;
    setGlobalState: (type: string, value: boolean | string | Record<string, any>) => void;
}

export default function globalStore (): GlobalStoreType {
    return {
        permissionsType: PermissionsTypeMap[PermissionsTypeEnum.none],
        showGuide: true,
        subscribeVisible: false,
        isLogin: false,
        globalToast: {
            visible: false,
            msg: '',
            color: 'danger',
            duration: 2000,
        },
        userInfo: null,
        setGlobalState (type: string, value: boolean | string | Record<string, any>) {
            //@ts-ignore
            this[type] = value;
        },
        async msgLogin (phoneNumber: string, creatorUsername: string) {
            this.setGlobalState('isLogin', true);
            try {
                await msgLogin({
                    phone_number: phoneNumber,
                    creator_username: creatorUsername,
                });
                this.setGlobalState('isLogin', false);
                this.setGlobalState(
                    'permissionsType',
                    PermissionsTypeMap[PermissionsTypeEnum.none],
                );
            } catch (error) {
                this.setGlobalState('isLogin', false);
                // 切换路由后全局toast不显示
                this.setGlobalState('globalToast', {
                    visible: true,
                    msg: error,
                    duration: 1000,
                });
            }
        },
        async login (phoneNumber: string, password: string) {
            this.setGlobalState('isLogin', true);
            const { data } = await login({ phone_number: phoneNumber, password });
            this.setGlobalState('isLogin', false);
            cookie.set('ACCESS_TOKEN', data.access_token, { path: '/' });
            cookie.set('REFRESH_TOKEN', data.refresh_token, { path: '/' });
            cookie.set('EXPIRED_TIME', new Date().getTime(), { path: '/' });
            localStorage.setItem('userInfo', JSON.stringify(data));
            this.setGlobalState('permissionsType', PermissionsTypeMap[PermissionsTypeEnum.none]);
            console.log(data);
        },
        async signup (phoneNumber: string, password: string) {
            const { data } = await signup({ phone_number: phoneNumber, password });
            console.log(data);
        },
        async resetPassWord (phoneNumber: string) {
            const { data } = await resetPassWord({ phone_number: phoneNumber });
            console.log(data);
        },
        async setUserInfo (userName: string) {
            const { data } = await getUserInfo({ visit_username: userName });
            runInAction(() => {
                this.userInfo = transformUserInfo(data);
            });
        },
        async confirmMsgLogin (token: string) {
            const { data } = await confirmMsgLogin({ login_token: token });
            cookie.set('ACCESS_TOKEN', data.access_token, { path: '/' });
            cookie.set('REFRESH_TOKEN', data.refresh_token, { path: '/' });
            cookie.set('EXPIRED_TIME', new Date().getTime(), { path: '/' });
            localStorage.setItem('userInfo', JSON.stringify(data));
            console.log(data);
        },
        async confirmSubscribe (token: string, creatorId: number, tierId: number) {
            const { data } = await confirmSubscribe({
                token,
                creator_id: creatorId,
                tier_id: tierId,
            });
            cookie.set('ACCESS_TOKEN', data.access_token, { path: '/' });
            cookie.set('REFRESH_TOKEN', data.refresh_token, { path: '/' });
            cookie.set('EXPIRED_TIME', new Date().getTime(), { path: '/' });
            console.log(data);
            return data;
        },
    };
}
