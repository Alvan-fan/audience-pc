const path = require('path');
const { i18n } = require('./next-i18next.config');

//配置环境变量
const NODE_ENV = process.env.NODE_ENV;
let BASE_URL = '';
if (NODE_ENV == 'production') {
    BASE_URL = 'https://api.housechan.com';
    STRIPE_KEY =
        'pk_live_51I9JshLXpKNZDmCJyUkpjFCIHdWrHyajjoM9O9lEBxHjyadyfFkPVVQv8hPK6g3BeSVGFXq3ygGWou5c5UbXAGRX00V2Uah9sw';
} else {
    BASE_URL = 'http://house-api-pre-1.eba-8jjbciyi.us-west-2.elasticbeanstalk.com';
    STRIPE_KEY =
        'pk_test_51I9JshLXpKNZDmCJJEEFwKofstROi9JYdxTPSv3xaNnnzSTfrCcOo9Jv06EynaXpUYx0t5zPuV0iglrxqqFSg0HN00T3IXPCDV';
}

/** @type {import('next').NextConfig} */
module.exports = {
    i18n,
    env: {
        NEXT_PUBLIC_BASE_URL: BASE_URL,
        NEXT_PUBLIC_STRIPE_KEY: STRIPE_KEY,
    },
    reactStrictMode: true,
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
    async redirects () {
        return [
            {
                source: '/',
                destination: '/creator',
                permanent: true,
            },
        ];
    },
};
