/**
 * @file post详情页媒体
 */
import React from 'react';

import ss from './index.module.scss';

interface IProps {
    url: string;
}

const MediaPlayer: React.FC<IProps> = (props) => {
    const { url } = props;

    if (url.substr(url.lastIndexOf('.')) !== '.mp4') {
        return <img src={url} className={ss.img} />;
    }

    return (
        <video className={ss.video} preload="metadata" autoPlay playsInline controls muted>
            <source src={url} />
        </video>
    );
};

export default MediaPlayer;
