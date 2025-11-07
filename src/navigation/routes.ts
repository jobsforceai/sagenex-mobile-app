import { NavigatorScreenParams } from "@react-navigation/native";

export enum RootRoutes {
    AuthStack = 'AuthStack',
    MainTabs = 'MainStack',
    Splash = 'Splash'
}

export enum AuthRoutes {
    Login = 'Login',
    Register = 'Register'
}

export enum MainRoutes {
    Home = 'Home',
    Profile = 'Profile',
    Notifications = 'Notifications',
    Leaderboard = 'Leaderboard',
    MyTree = 'MyTree',
    Wallet = 'Wallet',
    Settings = 'Settings'
}

export type RootStackParamList = {
    [RootRoutes.AuthStack]: undefined;
    [RootRoutes.MainTabs]: undefined;
    [RootRoutes.Splash]: undefined;
};

export type AuthStackParamList = {
    [AuthRoutes.Login]: undefined;
    [AuthRoutes.Register]: undefined;
};

export type MainTabParamList = {
    [MainRoutes.Home]: undefined;
    [MainRoutes.Leaderboard]: undefined;
    [MainRoutes.MyTree]: undefined;
    [MainRoutes.Wallet]: undefined;
    [MainRoutes.Settings]: undefined;
};

export type MainStackParamList = {
    MainTabs: NavigatorScreenParams<MainTabParamList>;
    [MainRoutes.Profile]: undefined;
    [MainRoutes.Notifications]: undefined;
    Rewards: undefined;
    KYC: undefined;
    Payouts: undefined;
};
