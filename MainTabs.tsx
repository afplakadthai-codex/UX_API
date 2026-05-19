import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';

import { HomeScreen } from '../screens/HomeScreen';

function ListingDetailScreen(): ReactElement | null {
  return null;
}

function AccountScreen(): ReactElement | null {
  return null;
}

function CartScreen(): ReactElement | null {
  return null;
}

function OffersScreen(): ReactElement | null {
  return null;
}

function ProfileScreen(): ReactElement | null {
  return null;
}

export type HomeStackParamList = {
  Home: undefined;
  ListingDetail: {
    listingId: string;
    listing?: unknown;
  };
};

export type AccountStackParamList = {
  AccountHome: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Offers: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        contentStyle: { backgroundColor: '#F8FAF9' },
        headerShown: false,
      }}
    >
      <HomeStack.Screen component={HomeScreen} name="Home" />
      <HomeStack.Screen component={ListingDetailScreen} name="ListingDetail" />
    </HomeStack.Navigator>
  );
}

function AccountStackNavigator() {
  return (
    <AccountStack.Navigator
      initialRouteName="AccountHome"
      screenOptions={{
        contentStyle: { backgroundColor: '#F8FAF9' },
        headerShown: false,
      }}
    >
      <AccountStack.Screen component={AccountScreen} name="AccountHome" />
      <AccountStack.Screen component={ProfileScreen} name="Profile" />
    </AccountStack.Navigator>
  );
}

function SearchScreen() {
  return null;
}

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen component={HomeStackNavigator} name="Home" />
      <Tab.Screen component={SearchScreen} name="Search" />
      <Tab.Screen component={CartScreen} name="Cart" />
      <Tab.Screen component={OffersScreen} name="Offers" />
      <Tab.Screen component={AccountStackNavigator} name="Account" />
    </Tab.Navigator>
  );
}