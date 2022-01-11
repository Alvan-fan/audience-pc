import { createContext, useContext, useState } from 'react';
import { extendObservable, observable } from 'mobx';

// 所有组件共享的 store对象
export let observableStore: any = null;

export const storeContext = createContext(Object.create(null));

// 创建 store 对象
const createStore = (globalStoreData: any) => {
    return observable({
        globalStore: Object.assign({}, globalStoreData),
    });
};

// store 初始化
export const initStore = (globalStoreData: any) => {
    observableStore = createStore(globalStoreData);
};

// get store hook
export const useStore = () => {
    let store;
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        store = useContext(storeContext);
    } catch (e) {
        // 非 hook 组件中会不能使用 useContext，直接返回 observableStore
        store = observableStore;
    }
    if (!store) {
        throw new Error('Store has not been initialized.');
    }
    return store;
};

// 动态增加 store 模块
export const addStore = (moduleName: string, moduleData: Record<string, any>) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const store = useStore();
    if (!store[moduleName]) {
        const module = Object.create(null);
        module[moduleName] = moduleData;
        extendObservable(store, module);
    }
    return store;
};

// store Layout components
export const StoreProvider = ({ children }: any) => {
    const [store] = useState(() => observableStore);
    return <storeContext.Provider value={store}>{children}</storeContext.Provider>;
};
