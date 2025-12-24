const ServerUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_CONFIG = {
    base_url: ServerUrl,
    refresh_token_url: `${ServerUrl}/api/v1/refresh-token`,
} as const;

const config = {
    base_url: ServerUrl,
    refresh_token_url: `${ServerUrl}/api/v1/refresh-token`,
    banner_image: process.env.NEXT_PUBLIC_BANNER_IMAGE,
} as const;

export default config;
