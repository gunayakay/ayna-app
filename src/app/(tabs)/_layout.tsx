import React, { useEffect, useRef } from 'react';

import { Tabs } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { TabBar } from '#components';
import AddGoalSheet from '#components/add-goal-sheet';
import { ROUTES } from '#constants';
import { Text } from '#components/atoms';
import { addGoalSheetRef } from '#/utils';

export default function TabsLayout() {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    addGoalSheetRef.register(() => sheetRef.current?.present());
    return () => addGoalSheetRef.unregister();
  }, []);

  return (
    <>
      <Tabs
        initialRouteName={ROUTES.HOME}
        screenOptions={{ headerShown: false }}
        tabBar={props => <TabBar {...props} />}>
        <Tabs.Screen name={ROUTES.HOME} options={{ title: 'Home' }} />
        <Tabs.Screen name={ROUTES.HISTORY} options={{ title: 'History' }} />
        <Tabs.Screen name={ROUTES.ANALYTICS} options={{ title: 'Analytics' }} />
        <Tabs.Screen name={ROUTES.ACCOUNT} options={{ title: 'Account' }} />
      </Tabs>

      <AddGoalSheet
        ref={sheetRef}
        onGoalAdded={addGoalSheetRef.notifyGoalsChanged}
      />
    </>
  );
}
