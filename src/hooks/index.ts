import { useState } from 'react';

export function useModalVisible (
    initialVisible: boolean = false,
): [boolean, () => void, () => void, (visible: boolean) => void, () => void] {
    const [visible, updateVisible] = useState(initialVisible);

    function showModal () {
        updateVisible(true);
    }
    function hideModal () {
        updateVisible(false);
    }
    function toggle () {
        if (visible === true) {
            hideModal();
        }
        if (visible === false) {
            showModal();
        }
    }

    return [visible, showModal, hideModal, updateVisible, toggle];
}
