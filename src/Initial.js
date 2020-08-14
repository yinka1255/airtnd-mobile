import React, { Component  } from 'react';
import { AppState, View, Text, Alert, Image, Button, TextInput, StyleSheet, ImageBackground, TouchableOpacity, AsyncStorage } from 'react-native';
import {NavigationActions} from 'react-navigation';

export class Initial extends Component {
  constructor(props) {
    super();
    
  }

  async componentDidMount() {
    
  }
  
  navigateToScreen = (route) => () => {
    const navigateAction = NavigationActions.navigate({
      routeName: route
    });
    this.props.navigation.dispatch(navigateAction);
  }
  static navigationOptions = {
      header: null
  }

  render() {
    return (
      <View>
        
      </View>
    )
  }
}

export default Initial

const styles = StyleSheet.create ({
  
})