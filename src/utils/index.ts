import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import dura from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { Cookie } from 'next-cookie';

// 扩展dayjs插件
dayjs.extend(calendar);
dayjs.extend(dura);
dayjs.extend(utc);

// 全局设置rem
export const SetRem = (win: any, doc: any) => {
    const changeSize = () => {
        doc.documentElement.style.fontSize = doc.documentElement.clientWidth / 3.75 + 'px';
    };
    changeSize();
    win.addEventListener('resize', changeSize, false);
};

// 全局导出cookie实例
export const cookie = new Cookie();

// 缓存服务端token
const serverToken = Object.create(null);

// 初始化用户状态
export const initUserState = (accessToken: string, refreshToken: string, expiredTime: string) => {
    serverToken.ACCESS_TOKEN = accessToken;
    serverToken.REFRESH_TOKEN = refreshToken;
    serverToken.EXPIRED_TIME = expiredTime;
};

// 判断token是否过期
export const isExpired = () => {
    if (cookie.get('EXPIRED_TIME') && serverToken.EXPIRED_TIME) {
        const nowTime = new Date().getTime();
        let cacheTime = 0;
        if (process.browser) {
            cacheTime = cookie.get('EXPIRED_TIME');
        } else {
            cacheTime = serverToken.EXPIRED_TIME;
        }
        const diffTime = parseInt(((nowTime - Number(cacheTime)) / 1000) as any);
        return diffTime > 86000;
    }
};

// 判断是否登陆
export const isLogin = () => {
    return !!(cookie.get('ACCESS_TOKEN') && !isExpired());
};

// 判断是否为手机端
export const isMobile = () => {
    return /mobile/i.test(navigator.userAgent);
};

// 全局导出获取token方法
export const getToken = (url: string) => {
    let key = 'ACCESS_TOKEN';
    if (url === '/refresh') {
        key = 'REFRESH_TOKEN';
    }
    if (!cookie.get(key) && !serverToken[key]) {
        return '';
    }
    if (process.browser) {
        return `Bearer ${cookie.get(key)}`;
    }
    return `Bearer ${serverToken[key]}`;
};

// 时间本地化
export const getLocalDate = (date: string = dayjs().utc().toISOString()) => {
    const utcDate = dayjs.utc(date);
    let currentTime = utcDate.local().format('YYYY-MM-DD HH:mm');
    const duration = dayjs.duration(dayjs().diff(date)).asDays();
    if (duration <= 7) {
        const calender = utcDate.calendar().split(' ');
        if (calender[0] === 'Last') {
            currentTime = `${calender[1]}&&&${utcDate.local().format('HH:mm')}`;
        } else {
            currentTime = `${calender[0]}&&&${utcDate.local().format('HH:mm')}`;
        }
    }
    return currentTime;
};

// 获取国家语言
export const getCountryCode = () => {
    const language = navigator.language.toLowerCase() || 'us';
    const languageArr = language.split('-');
    if (languageArr[0] === 'en') {
        return 'us';
    }
    if (languageArr.length > 1) {
        return languageArr[1];
    }
    return languageArr[0];
};

// 获取国际化语言地区
export const getI18nLanguage = (ctx: any) => {
    const language = ctx.req.headers['accept-language']?.split(',')?.[0] || 'en';
    if (language !== 'en' && language !== 'zh-TW') {
        return 'en';
    }
    return language;
};
