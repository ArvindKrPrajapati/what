import React from 'react';
import { LogBox, StatusBar } from 'react-native';
import { AuthContextProvier } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthContextProvier>
      {LogBox.ignoreAllLogs()}
      <RootNavigator />
    </AuthContextProvier>
  );
}