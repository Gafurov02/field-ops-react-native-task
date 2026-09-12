import appJson from './app.json';

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

export default {
  ...appJson.expo,
  owner: 'gafurov',
  slug: 'field-ops-react-native-task',
  extra: {
    ...appJson.expo.extra,
    eas: {
      projectId: '30f6b867-f407-4990-affb-c015b9527317',
    },
  },
  android: {
    ...appJson.expo.android,
    config: googleMapsApiKey ? { googleMaps: { apiKey: googleMapsApiKey } } : undefined,
  },
};
