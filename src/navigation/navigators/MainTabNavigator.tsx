import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainRoutes } from '../routes';
import HomeScreen from '../../screens/main/HomeScreen';
import LeaderboardScreen from '../../screens/main/LeaderboardScreen';
import MyTreeScreen from '../../screens/main/MyTreeScreen';
import SettingsScreen from '../../screens/main/SettingsScreen';
import WalletScreen from '../../screens/main/WalletScreen';
import TabBarIcon from '../../components/TabBarIcon'
import HomeIcon from '../../components/icons/HomeIcon'
import LeaderboardIcon from '../../components/icons/LeaderboardIcon'
import MyTreeIcon from '../../components/icons/MyTreeIcon'
import WalletIcon from '../../components/icons/WalletIcon'
import SettingsIcon from '../../components/icons/SettingsIcon'


const Tab = createBottomTabNavigator();
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.floatingTabBar,
        tabBarItemStyle: { alignItems: 'center', justifyContent: 'center' },
        tabBarIconStyle: { marginTop: 12 },
        tabBarIcon: ({ focused, size = 16 }) => {
          switch (route.name) {
            case MainRoutes.Home:
              return <TabBarIcon
                Icon={HomeIcon}
                focused={focused}
                size={size} />

            case MainRoutes.Leaderboard:
              return <TabBarIcon
                Icon={LeaderboardIcon}
                focused={focused}
                size={30} />

            case MainRoutes.MyTree:
              return <TabBarIcon
                Icon={MyTreeIcon}
                focused={focused}
                size={size} />

            case MainRoutes.Wallet:
              return <TabBarIcon
                Icon={WalletIcon}
                focused={focused}
                size={size} />

            case MainRoutes.Settings:
              return <TabBarIcon
                Icon={SettingsIcon}
                focused={focused}
                size={size} />
                
            default:
              return <TabBarIcon
                Icon={HomeIcon}
                focused={focused}
                size={size} />
          }
        },
      })}
    >
      <Tab.Screen name={MainRoutes.Home} component={HomeScreen} />
      <Tab.Screen name={MainRoutes.Leaderboard} component={LeaderboardScreen} />
      <Tab.Screen name={MainRoutes.MyTree} component={MyTreeScreen} />
      <Tab.Screen name={MainRoutes.Wallet} component={WalletScreen} />
      <Tab.Screen name={MainRoutes.Settings} component={SettingsScreen} />
    </Tab.Navigator>
  )
}

export default MainTabNavigator

const styles = StyleSheet.create({
  floatingTabBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 64,
    marginHorizontal: 20,
    borderRadius: 40,
    backgroundColor: '#0b0b0b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
})