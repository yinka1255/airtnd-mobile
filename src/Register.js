import React, { Component  } from 'react';
import { AppState, View, Text, Alert, Image, Button, TextInput, Linking, StyleSheet,BackHandler, ActivityIndicator, Dimensions, ScrollView, ImageBackground, StatusBar, TouchableOpacity, AsyncStorage } from 'react-native';
import {NavigationActions} from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import { SERVER_URL } from './config/server';
import Modal from 'react-native-modal';

//const { Height } = Dimensions.get('window')
 

export class Register extends Component {
  constructor(props) {
    super();
    this.handleBackPress = this.handleBackPress.bind(this);
    this.state = {
      radioButtons: ['Option1', 'Option2', 'Option3'],
      checked: 0,
      toggleUpdate: false,
      billers: false,
      name: '',
      email: '',
      phone: '',
      password: '',
      cpassword: '',
      customer: '',
      visible: false,
    }
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
          text: "No, stay",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Yes leave", onPress: () => BackHandler.exitApp() }
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
  validateEmail(email) 
  {
      var re = /\S+@\S+\.\S+/;
      return re.test(email);
  }
  register(){
    if(this.state.name.length < 3){
      Alert.alert("Name must be atleast 3 characters long")
      return;
    }
    if(this.state.phone.length < 11){
      Alert.alert("Phone must be atleast 11 characters long")
      return;
    }
    if(!this.validateEmail(this.state.email)){
      Alert.alert("Kindly provide a valid email")
      return;
    }
    if(this.state.password.length < 6){
      Alert.alert("Password must be atleast 6 characters long")
      return;
    }
    if(this.state.password != this.state.cpassword){
      Alert.alert("Passwords provided do not match")
      return;
    }
    console.log('a');
      this.showLoader();
      fetch(`${SERVER_URL}/mobile/register`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: this.state.name,
            email: this.state.email,
            phone: this.state.phone,
            password: this.state.password,
            from: 'IOS',
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

  
  
  showAlert(type, message){
    setTimeout(()=>{
      Alert.alert(
        type,
        message,
      );
    },500) 
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
      <View style = {styles.body}>
        <ScrollView>
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}}  colors={['#e2aa2e', '#a75502']} style={styles.headerView}>
          <StatusBar translucent={true}  backgroundColor={'transparent'}  />
          <Text style = {styles.headerText}>Welcome</Text>
          <Text style = {styles.headerText1}>Create your account</Text>
          {/*
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Home')}  ><Text style = {styles.headerText1}>Back to home</Text></TouchableOpacity>
          */}
        </LinearGradient>
        <View style = {styles.bottomView}>
        <Image source = {require('./imgs/logo.png')} style = {styles.logoImage} />
        <TextInput
                          style={styles.input}
                          placeholder="Name"
                          onChangeText={(text) => this.setState({name: text})}
                          underlineColorAndroid="transparent"
                        />
        <TextInput
                          style={styles.input}
                          placeholder="Phone"
                          onChangeText={(text) => this.setState({phone: text})}
                          underlineColorAndroid="transparent"
                          minLength={11}
                          maxLength={11}
                          keyboardType={'phone-pad'}
                        />
        <TextInput
                          style={styles.input}
                          placeholder="Email"
                          onChangeText={(text) => this.setState({email: text})}
                          underlineColorAndroid="transparent"
                          keyboardType={'email-address'}
                          autoCapitalize = "none"
                        />
        <TextInput
                          style={styles.input}
                          placeholder="Password"
                          onChangeText={(text) => this.setState({password:text})}
                          underlineColorAndroid="transparent"
                          minLength={4}
                          autoCapitalize = "none"
                          secureTextEntry={true} 
                        />
        <TextInput
                          style={styles.input}
                          placeholder="Confirm Password"
                          onChangeText={(text) => this.setState({cpassword:text})}
                          underlineColorAndroid="transparent"
                          minLength={4}
                          autoCapitalize = "none"
                          secureTextEntry={true} 
                        />
        <TouchableOpacity style = {styles.forgotView} onPress={() => Linking.openURL('https://airtnd.com/terms')}>
        <Text style = {styles.forgotText1}>By clicking the create account button, you agree to <Text style = {styles.forgotText}>terms and agreement</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity /* onPress={() => this.login()} */  onPress={() => { this.register()}}  style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Create account</Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.forgotView} onPress={() => this.props.navigation.navigate('Login')}>
          <Text style = {styles.createText}>BACK TO LOGIN</Text>
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
        </ScrollView>
      </View>
    )
  }
}

export default Register

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
    height: 300,
    borderBottomLeftRadius: 52,
    zIndex: 1
  },
  headerText: {
    color: '#fff',
    paddingLeft: 20,
    marginTop: 80,
    fontSize: 15
  },
  headerText1: {
    color: '#fff',
    paddingLeft: 20,
    fontSize: 12
  },
  bottomView: {
    width: '85%',
    alignSelf: 'center',
    backgroundColor: '#000',
    minHeight: 550,
    borderBottomRightRadius: 32,
    borderTopLeftRadius: 32,
    marginTop: -160,
    zIndex: 99999
  },
  logoImage: {
    width: 80,
    height: 53,
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  loaderImage: {
    width: 19,
    height: 19,
    zIndex: 9999999999999999999,
    alignSelf: 'center',
    marginTop: '-60%'
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
  forgotText: {
    //textAlign: 'right',
    //marginRight: 30,
    color: '#e2aa2e',
    fontSize: 12,
    marginTop: 10,
  },
  forgotText1: {
    textAlign: 'left',
    marginLeft: 30,
    marginRight: 30,
    color: '#999',
    fontSize: 12,
    marginTop: 10,
  },
  createText: {
    textAlign: 'center',
    color: '#e2aa2e',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    paddingBottom: 15,
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
  
})