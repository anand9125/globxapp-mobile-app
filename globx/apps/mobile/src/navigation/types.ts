import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Trade: undefined;
  Markets: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  Deposit: undefined;
  Withdraw: undefined;
  History: undefined;
  Settings: undefined;
} & {
  [K in keyof AuthStackParamList]: AuthStackParamList[K];
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
    interface AuthParamList extends AuthStackParamList {}
  }
}
