import { Tabs } from 'expo-router';

import TabBar from '#components/tab-bar';
import { ROUTES } from '#constants';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName={ROUTES.HOME}
      screenOptions={{ headerShown: false }}
      tabBar={props => <TabBar {...props} />}>
      <Tabs.Screen name={ROUTES.HOME} options={{ title: 'Home' }} />
      <Tabs.Screen name={ROUTES.ACCOUNT} options={{ title: 'Account' }} />
    </Tabs>
  );
}
