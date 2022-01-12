import React, { useCallback, useState } from 'react';
import cx from 'classnames';

import ss from './index.module.scss';

interface IConfig {
    key: string;
    label: string;
}

interface IProps {
    config: IConfig[];
    containerClass?: string;
    itemClass?: string;
    value?: string;
    onChange: (key: string) => void;
}
const Tabs: React.FC<IProps> = (props) => {
    const { config, containerClass, itemClass, value = '1', onChange } = props;
    const [currentKey, setCurrentKey] = useState<string>(value);

    const changeTab = useCallback((key: string) => {
        onChange && onChange(key);
        setCurrentKey(key);
    }, []);

    return (
        <ul className={cx(ss.container, containerClass)}>
            {config.map((item: IConfig) => {
                return (
                    <li
                        className={cx(ss.item, itemClass, {
                            [ss.active]: currentKey === item.key,
                        })}
                        key={item.key}
                        onClick={() => changeTab(item.key)}
                    >
                        {item.label}
                    </li>
                );
            })}
        </ul>
    );
};

export default Tabs;
