import appJson from './app.json';

export default {
  ...appJson.expo,
  owner: 'gafurov',
  slug: 'field-ops-react-native-task',
  extra: {
    eas: {
      projectId: '30f6b867-f407-4990-affb-c015b9527317',
    },
  },
  android: appJson.expo.android,
};
