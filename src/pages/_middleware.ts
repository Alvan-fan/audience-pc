import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { REDIRECT_DOMAIN } from '@/utils/config';

export async function middleware (req: NextRequest) {
    const {
        //@ts-ignore
        ua: { ua },
        nextUrl: { pathname },
    } = req;

    if (/mobile/i.test(ua)) {
        return NextResponse.redirect(`${REDIRECT_DOMAIN}${pathname}`);
    }
}
