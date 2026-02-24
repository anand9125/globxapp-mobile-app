import type { NativeStackScreenProps } from "@react-navigation/native-stack";

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
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
