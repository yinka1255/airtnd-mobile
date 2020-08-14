import React, { Component  } from 'react';
import { AppState, View, Text, Alert, Image, Button, TextInput, StyleSheet, ScrollView,BackHandler, ActivityIndicator, ImageBackground, StatusBar, TouchableOpacity, AsyncStorage } from 'react-native';
import {NavigationActions} from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import { SERVER_URL } from './config/server';

export class Login extends Component {
  constructor(props) {
    super();
    this.handleBackPress = this.handleBackPress.bind(this);
    this.state = {
      radioButtons: ['Option1', 'Option2', 'Option3'],
      checked: 0,
      toggleUpdate: false,
      visible: false,
      forgotVisible: false,
      email: '',
      password: '',
      email1: '',
    }
    this.getLoggedInUser();
  }

  async componentDidMount() {
    
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress = () => {
    Alert.alert(
      "Confirm exit",
      "Are you sure you want to exit this app?",
      [
        {
          text: "Stay here",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        //{ text: "Go to home", onPress: () => this.props.navigation.navigate('Home') },
        { text: "Leave", onPress: () => BackHandler.exitApp() }
      ],
      //{ cancelable: false }
    );
    return true
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  toggleUpdate(){
    if(this.state.toggleUpdate == true){
      this.setState({
        toggleUpdate: false
      })
    }else{
      this.setState({
        toggleUpdate: true
      })
    }
  }
  showAlert(type, message){
    setTimeout(()=>{
      Alert.alert(
        type,
        message,
      );
    },500) 
  }

  async getLoggedInUser(){
    await AsyncStorage.getItem('customer').then((value) => {
      if(value){
        this.props.navigation.navigate('Home')
        // this.setState({
        //   customer: JSON.parse(value)
        // }, () => {
        //   this.setState({
        //     customer_id: this.state.customer.id
        //   })
        // });
          
      }else{
        AsyncStorage.getItem('loginvalue').then((value) => {
          if(value){
            this.setState({
              email: value
            })
          }   
        });
      }
    });
  }
  showLoader(){
    this.setState({
      visible: true
    });
  }
  hideLoader(){
    this.setState({
      visible: false
    });
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

  login(){
    console.log(this.state.email, 'email');
    console.log(this.state.password, 'password');
      this.showLoader();
      fetch(`${SERVER_URL}/mobile/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: this.state.email,
            password: this.state.password,
        })
      }).then((response) => response.json())
          .then((res) => {
            this.hideLoader();
            if(res.success){
              AsyncStorage.setItem('customer', JSON.stringify(res.customer)).then(() => {
                AsyncStorage.setItem('loginvalue', this.state.email).then(() => {
                  this.props.navigation.navigate('Home')
                });
                //this.showAlert("error", res.error)
              });
            }else{
              this.showAlert("Error", res.error)
            }
    }).done();
  }

  forgot(){
      this.showLoader();
      fetch(`${SERVER_URL}/mobile/forgot_password_post`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: this.state.email,
        })
      }).then((response) => response.json())
          .then((res) => {
            this.hideLoader();
            if(res.success){
              this.showAlert("success", res.success)
            }else{
              this.showAlert("Error", res.error)
            }
    }).done();
  }
  

  render() {
    const { visible } = this.state;
    return (
      <View style = {styles.body}>
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}}  colors={['#e2aa2e', '#a75502']} style={styles.headerView}>
          <StatusBar translucent={true}  backgroundColor={'transparent'}  />
          <Text style = {styles.headerText}>Welcome</Text>
          <Text style = {styles.headerText1}>Log in to your account</Text>
          {/*
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Home')} ><Text style = {styles.headerText2}>Back to home</Text></TouchableOpacity>
          */}
        </LinearGradient>
        <View style = {styles.bottomView}>
        <Image source = {require('./imgs/logo.png')} style = {styles.logoImage} />
        <TextInput
                          style={styles.input}
                          placeholder="Email/Phone"
                          onChangeText={(text) => this.setState({email: text})}
                          underlineColorAndroid="transparent"
                          value={this.state.email}
                          //keyboardType={'email-address'}
                          autoCapitalize = "none"
                        />
        <TextInput
                          style={styles.input}
                          placeholder="Password"
                          onChangeText={(text) => this.setState({password:text})}
                          underlineColorAndroid="transparent"
                          autoCapitalize = "none"
                          secureTextEntry={true} 
                        />
        <TouchableOpacity style = {styles.forgotView}  onPress={() => this.setState({'forgotVisible': true})}>
          <Text style = {styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity  onPress={() => this.login()} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Login</Text>
          
        </TouchableOpacity>
        <TouchableOpacity style = {styles.forgotView} onPress={() => this.props.navigation.navigate('Register')}>
          <Text style = {styles.createText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>
        </View>


        <Modal
          isVisible={this.state.visible}
          onTouchOutside={() => {
            //this.setState({ visible: false });
          }}
          height= {'100%'}
          width= {'100%'}
          style={styles.modal}
        >
          <View style={styles.modalView}>
          <ActivityIndicator size="small" color="#ccc" />
          </View>
        </Modal>

        <Modal
          isVisible={this.state.forgotVisible}
          onBackdropPress={() => {
            this.setState({ forgotVisible: false });
          }}
          height= {'100%'}
          width= {'100%'}
          style={styles.modal}
        >
          <View style={styles.forgotModalView}>
          <Text style = {styles.headerText7}>Forgot password</Text>
          <Text style = {styles.headerText8}>Type in the email you registered with and we will send your login details there</Text>

          <Text style = {styles.label1}>Email</Text>
              <TextInput
                          style={styles.input1}
                          onChangeText={(text) => this.setState({email1: text})}
                          underlineColorAndroid="transparent"
                          keyboardType={'email-address'}
                          value={this.state.email1}
                        />
          <TouchableOpacity  onPress={() => this.forgot()} style={styles.submitButton1}>
          <Text style={styles.submitButtonText}>Reset password</Text>
          
        </TouchableOpacity>
          </View>
        </Modal>
        
      </View>
    )
  }
}

export default Login

const styles = StyleSheet.create ({
  container: {
    width: '100%',
  },
  body: {
    minHeight: '100%',
    backgroundColor: "#111",
  },
  headerView: {
    width: '100%',
    height: '55%',
    borderBottomLeftRadius: 52,
    zIndex: 1
  },
  loaderImage: {
    width: 19,
    height: 19,
    zIndex: 9999999999999999999,
    alignSelf: 'center',
    marginTop: '-60%'
  },
  headerText: {
    color: '#fff',
    paddingLeft: 20,
    marginTop: 90,
    fontSize: 15
  },
  headerText1: {
    color: '#fff',
    paddingLeft: 20,
    fontSize: 12
  },

  headerText7: {
    color: '#333',
    paddingLeft: 20,
    fontWeight: '700',
    marginTop: 5,
    fontSize: 15
  },
  headerText8: {
    color: '#333',
    paddingLeft: 20,
    fontSize: 12
  },
  headerText2: {
    color: '#fff',
    paddingLeft: 20,
    fontSize: 12,
    textAlign: 'right',
    marginRight: 30,
  },
  bottomView: {
    width: '85%',
    alignSelf: 'center',
    backgroundColor: '#000',
    minHeight: '60%',
    borderBottomRightRadius: 32,
    borderTopLeftRadius: 32,
    marginTop: '-60%',
    zIndex: 99999
  },
  logoImage: {
    width: 80,
    height: 53,
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    backgroundColor: '#444',
    borderRadius: 28,
    alignSelf: 'center',
    marginTop: 15,
    paddingLeft: 25,
    color: '#ccc'
  },
  input1: {
    width: '90%',
    height: 40,
    backgroundColor: '#aaa',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    paddingLeft: 25,
    color: '#222'
  },
  forgotText: {
    textAlign: 'right',
    marginRight: 30,
    color: '#e2aa2e',
    fontSize: 12,
    marginTop: 10,
  },
  createText: {
    textAlign: 'center',
    color: '#e2aa2e',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  
submitButton: {
  marginTop: 20,
  backgroundColor: '#e2aa2e',
  opacity: 0.7,
  borderRadius: 28,
  width: '80%',
  alignSelf: 'center',
  paddingTop: 12,
  paddingBottom: 13,
},
submitButton1: {
  marginTop: 20,
  backgroundColor: '#e2aa2e',
  opacity: 0.7,
  borderRadius: 2,
  width: '90%',
  alignSelf: 'center',
  paddingTop: 12,
  paddingBottom: 13,
},
submitButtonText: {
  color: '#fff',
  textAlign: 'center'
},
loaderImage: {
  width: 80,
  height: 80,
  alignSelf: 'center',
  zIndex: 99999999999999,
  
},
modal: {
  margin: 0,
  padding: 0
},
modalView: {
  // width: '100%',
  // height: '100%',
  // opacity: 0.9,
  alignSelf: 'center',
  height: 50,
  width: 100,
  backgroundColor: '#FFF',
  paddingTop: 18,
},
label: {
  color: '#333',
  marginTop: 15,
  paddingLeft: 30,
},
label1: {
  color: '#333',
  marginTop: 15,
  paddingLeft: 20,
},
forgotModalView: {
  // width: '100%',
  // height: '100%',
  // opacity: 0.9,
  alignSelf: 'center',
  height: 280,
  width: '90%',
  backgroundColor: '#FFF',
  paddingTop: 18,
},
  
})