/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            'ui-avatars.com',
            'images.unsplash.com',
            'i.ytimg.com',
            'avatars.githubusercontent.com',
            'localhost'
        ],
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: false,
            },
        ];
    },
};

module.exports = nextConfig;
