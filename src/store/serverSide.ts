// 作为一个示例，服务端获取数据

import { useStore } from '@/store';
import type { GlobalStoreType } from '@/store/globalStore';

export const getList = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const store: GlobalStoreType = useStore().globalStore;
    console.log(store);
    store.signup('+13111111111', '123123123');
};
