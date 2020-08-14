import React, { Component } from 'react';
import { AppRegistry, Dimensions } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { Button, Platform, StyleSheet, Text, View, TouchableOpacity,AsyncStorage } from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import Initial from './src/Initial';
import Home from './src/Home';
import Data from './src/Data';
import AirtimeConfirm from './src/AirtimeConfirm';
import DataConfirm from './src/DataConfirm';
import Transactions from './src/Transactions';
import Profile from './src/Profile';
import Login from './src/Login';
import Register from './src/Register';

console.disableYellowBox = true;


const MainNavigator = createStackNavigator({
  Login: {screen: Login},
  Home: {screen: Home},
  Data: {screen: Data},
  AirtimeConfirm: {screen: AirtimeConfirm},
  DataConfirm: {screen: DataConfirm},
  Transactions: {screen: Transactions},
  Profile: {screen: Profile},
  Login: {screen: Login},
  Register: {screen: Register},
  Initial: {screen: Initial}
   
});

AppRegistry.registerComponent(appName, () => createAppContainer(MainNavigator));