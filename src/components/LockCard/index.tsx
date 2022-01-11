/**
 * @file 内容锁定展示卡片
 */

import React from 'react';
import lockIcon from '/public/img/lock.svg';
import photoIcon from '/public/img/photo.svg';
import videoIcon from '/public/img/video.svg';
import { observer } from 'mobx-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';

import ss from './index.module.scss';

const LockCard: React.FC = () => {
    const { t } = useTranslation();
    const store: GlobalStoreType = useStore().globalStore;
    const { userInfo } = store;

    if (!userInfo) {
        return null;
    }

    const { post_count, username = '' } = userInfo;
    const { video_post_count = 0, image_post_count = 0 } = post_count;

    return (
        <div className={ss.lockContainer}>
            <div className={ss.lockContent}>
                <div className={ss.lockImg}>
                    <Image src={lockIcon} />
                </div>
                <div className={ss.lockHead}>
                    <Image src={photoIcon} />
                    <span className={ss.resourceNumber}>{image_post_count}</span>
                    <Image src={videoIcon} />
                    <span className={ss.resourceNumber}>{video_post_count}</span>
                </div>
            </div>
            <div
                className={ss.lockBtn}
                onClick={() => {
                    store.setGlobalState('subscribeVisible', true);
                }}
            >
                {`${t('Subscribe to unlock')} ${username} ${t('’s posts')}`}
            </div>
        </div>
    );
};

export default observer(LockCard);
