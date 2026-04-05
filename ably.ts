import * as Ably from 'ably';

let ablyInstance: Ably.Realtime | null = null;

export const getAblyClient = () => {
    if (typeof window === 'undefined') return null;

    if (!ablyInstance) {
        const apiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
        if (!apiKey || apiKey === 'your-ably-api-key' || apiKey === 'your-key' || !apiKey.includes('.')) {
            console.warn('Ably API Key missing or invalid, falling back to simulation mode.');
            return null;
        }

        ablyInstance = new Ably.Realtime({ key: apiKey });
    }

    return ablyInstance;
};
