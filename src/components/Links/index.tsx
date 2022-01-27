/**
 * @file 外链页面
 */
import React, { useCallback, useMemo, useState } from 'react';
import webInitIcon from '/public/img/web-init-Icon.png';
import cx from 'classnames';
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import { observer } from 'mobx-react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useStore } from '@/store';
import { logEvent } from '@/utils/analytics';
import { IonIcon, IonSlide, IonSlides } from '@ionic/react';

import ss from './index.module.scss';

interface ILinkType {
    link_name: string;
    link_img?: string;
    link: string;
    link_color: string;
    link_id: string;
    link_icon: string;
    link_icon_url: string;
}

const Links: React.FC = () => {
    const store = useStore().globalStore;
    const router = useRouter();
    const { userInfo } = store;
    const [swiper, setSwiper] = useState<any>({});
    const [hideSlideBar, setHideSlideBar] = useState<string>('hidePrev');

    async function getSwiperInstance (this: any) {
        setSwiper(await this.getSwiper());
    }

    const linkCount = useMemo(() => {
        if (userInfo) {
            const len = userInfo.social_links.length || 0;
            return len;
        }
    }, [userInfo]);

    const RenderSlideBar = useCallback(() => {
        return (
            <>
                <IonIcon
                    className={cx(ss.slideBtn, ss.right, {
                        [ss.hide]: hideSlideBar === 'hideNext',
                    })}
                    icon={arrowForwardOutline}
                    onClick={() => {
                        swiper.slideNext();
                        swiper.isEnd && setHideSlideBar('hideNext');
                    }}
                />
                <div>
                    <IonIcon
                        className={cx(ss.slideBtn, ss.left, {
                            [ss.hide]: hideSlideBar === 'hidePrev',
                        })}
                        icon={arrowBackOutline}
                        onClick={() => {
                            swiper.slidePrev();
                            swiper.isBeginning && setHideSlideBar('hidePrev');
                        }}
                    />
                </div>
            </>
        );
    }, [swiper, hideSlideBar]);

    const RenderLinkItem = useCallback(({ data }: { data: ILinkType }) => {
        const { link_img, link_icon, link_icon_url } = data;
        if (link_img) {
            return null;
        }
        if (link_icon_url && link_icon !== 'web') {
            return (
                <div className={ss.customImg}>
                    <img className={ss.linkIcon} src={link_icon_url} alt="" />
                </div>
            );
        }
        return (
            <div className={ss.defaultImg}>
                <Image src={webInitIcon} className={ss.defaultLinkIcon} />
            </div>
        );
    }, []);

    if (linkCount === 0 || !userInfo) {
        return <div className={ss.containerMarginTop} />;
    }

    return (
        <div className={ss.container}>
            <RenderSlideBar />
            <IonSlides
                onIonSlidesDidLoad={getSwiperInstance}
                options={{
                    slidesPerView: 'auto',
                    freeMode: true,
                }}
                className={ss.sliders}
            >
                {userInfo.social_links.map((item: ILinkType) => (
                    <IonSlide
                        key={item.link_id}
                        style={{
                            background: item.link_img ? `url(${item.link_img})` : item.link_color,
                            backgroundSize: 'cover',
                        }}
                        className={ss.linkItem}
                        onClick={() => {
                            logEvent('out_link', 'click link');
                            router.replace(item.link);
                        }}
                    >
                        <RenderLinkItem data={item} />
                        <div className={ss.slideContent}>
                            <div className={ss.linkName}>{item.link_name}</div>
                        </div>
                    </IonSlide>
                ))}
            </IonSlides>
        </div>
    );
};

export default observer(Links);
