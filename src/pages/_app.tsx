// import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import App from 'next/app';
import { useCookie } from 'next-cookie';
import { appWithTranslation } from 'next-i18next';

import Layout from '@/components/Layout';
import { initStore, StoreProvider } from '@/store';
import globalStore from '@/store/globalStore';
import { cookie, initUserState } from '@/utils';
import { initGA } from '@/utils/analytics';
import { STRIPE_KEY } from '@/utils/config';
import { GA_TRACKING_ID } from '@/utils/config';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import '@/styles/globals.css';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

const stripePromise = loadStripe(STRIPE_KEY as string);

const MyApp = (props: any) => {
    const { Component, pageProps } = props;

    useEffect(() => {
        initGA(GA_TRACKING_ID);
        initUserState(
            cookie.get('ACCESS_TOKEN'),
            cookie.get('REFRESH_TOKEN'),
            cookie.get('EXPIRED_TIME'),
        );
    }, []);
    initStore(globalStore());

    return (
        <StoreProvider>
            <Elements stripe={stripePromise}>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </Elements>
        </StoreProvider>
    );
};

MyApp.getInitialProps = async (appContext: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { cookie: serverCookie } = useCookie(appContext.ctx);
    const appProps = await App.getInitialProps(appContext);

    initStore(globalStore());
    initUserState(
        serverCookie.get('ACCESS_TOKEN'),
        serverCookie.get('REFRESH_TOKEN'),
        serverCookie.get('EXPIRED_TIME'),
    );

    return { ...appProps };
};

export default appWithTranslation(MyApp);
