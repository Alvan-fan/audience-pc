import type { UserType } from '@/store/globalStore';

export const transformUserInfo = (data: UserType) => {
    return {
        ...data,
        social_links: JSON.parse(data.social_links || '[]'),
    };
};
