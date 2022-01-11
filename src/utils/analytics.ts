import ReactGA from 'react-ga';
import Router from 'next/router';

/**
 * Call this once in App (pages/_app.js) in componentDidMount
 *
 *  componentDidMount() {
 *   initGA(process.env.UA);
 * }
 *
 * Set UA environment variable to your "UA-000000-01"
 *
 * This attaches only if process.browser and UA is set.
 *
 * @param {string} UA Google Analytics UA code
 */
export const initGA = (UA: string) => {
    if (UA && process.browser) {
        ReactGA.initialize(UA, { debug: false });
        // ReactGA.initialize(UA, { debug: process.env.NODE_ENV === 'development' });
        logPageViews();
    }
};

export const logPageView = () => {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
};

export function logPageViews () {
    logPageView();
    Router.events.on('routeChangeComplete', () => {
        logPageView();
    });
}

export const logEvent = (category = '', action = '', label = '') => {
    if (category && action) {
        ReactGA.event({ category, action, label });
    }
};

export const logException = (description = '', fatal = false) => {
    if (description) {
        ReactGA.exception({ description, fatal });
    }
};
