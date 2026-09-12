import appJson from './app.json';

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

export default {
  ...appJson.expo,
  android: {
    ...appJson.expo.android,
    config: googleMapsApiKey ? { googleMaps: { apiKey: googleMapsApiKey } } : undefined,
  },
};
