/**
 * @file 骨架屏
 */

import React from 'react';

import { IonSkeletonText } from '@ionic/react';

interface IProps {
    rows?: number;
    style?: React.CSSProperties;
}

//@ts-ignore
const Skeleton: React.FC<IProps> = (props) => {
    const { rows = 1, style } = props;
    const arr = [];
    for (let i = 0; i < rows; i++) {
        arr.push(<IonSkeletonText animated style={style} key={i} />);
    }
    return arr;
};

export default Skeleton;
