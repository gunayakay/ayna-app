import { Tabs } from 'expo-router';

import { TabBar } from '#components';
import { ROUTES } from '#constants';
import { Text } from '#components/atoms';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName={ROUTES.HOME}
      screenOptions={{ headerShown: false }}
      tabBar={props => <TabBar {...props} />}>
      <Tabs.Screen name={ROUTES.HOME} options={{ title: 'Home' }} />
      <Tabs.Screen name={ROUTES.HISTORY} options={{ title: 'History' }} />
      <Tabs.Screen name={ROUTES.ANALYTICS} options={{ title: 'Analytics' }} />
      <Tabs.Screen name={ROUTES.ACCOUNT} options={{ title: 'Account' }} />
    </Tabs>
  );
}
