/**
 * @file 数据为空的缺省页
 */
import React from 'react';

import ss from './index.module.scss';
interface IProps {
    //
}
const EmptyPage: React.FC<IProps> = () => {
    return (
        <div className={ss.container}>
            <div>这个人很懒，什么都没留下</div>
        </div>
    );
};

export default EmptyPage;
