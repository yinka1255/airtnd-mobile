import React, { Component  } from 'react';
import { AppState, View, Text, Alert, Image, Button, TextInput, StyleSheet, ScrollView, ActivityIndicator, ImageBackground, StatusBar, TouchableOpacity, AsyncStorage } from 'react-native';
import {NavigationActions} from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import { SERVER_URL } from './config/server';
import { Linking } from 'react-native'
import InAppBrowser from 'react-native-inappbrowser-reborn'


export class Profile extends Component {
  constructor(props) {
    super();
    this.state = {
      server_url: SERVER_URL,
      radioButtons: ['Option1', 'Option2', 'Option3'],
      checked: 0,
      toggleUpdate: false,
      customer: false,
      name: '',
      email: '',
      phone: '',
      password: '',
      cpassword: '',
      currentPassword: '',
      currentPassword1: '',
      fundVisible: false,
      amount: '',
      balance: false,
      refresh: false,
    }
    this.getCustomerFromStorage();
    this.validateEmail = this.validateEmail.bind(this);

  }

  componentDidMount() {
    
  }

  async getCustomerFromStorage(){
    console.log("s");
    await AsyncStorage.getItem('customer').then((value) => {
      var d = JSON.parse(value);
      console.log(value, "aa");
      this.setState({
        customer: d,
        name: d.name,
        email: d.email,
        phone: d.phone,
        refresh: false,

      }, () => {
        this.getABalance();
        });
    });
  }

  getABalance(){
    //this.showLoader();
    fetch(`${SERVER_URL}/mobile/get_balance/${this.state.customer.id}`, {
         method: 'GET'
      })
      .then((response) => response.json())
      .then((res) => {
        console.log(res, 'ii');
          if(res.success){
            this.setState({
              balance:  res.success
            }, () => {
              this.setState({
                refresh: false
              })
            });
          }else{
            Alert.alert('Error', res.error);
          }
      })
      .catch((error) => {
         console.error(error);
         Alert.alert(
          "Communictaion error",
          "Ensure you have an active internet connection",
          [
            {
              text: "Ok",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "Refresh", onPress: () => this.getABalance() }
          ],
          //{ cancelable: false }
        );
    });
 }

  async openLink() {
    try {
      const url = `${this.state.server_url}/mobile/fund_wallet_online/${this.state.customer.id}/${this.state.amount}`
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'close',
          preferredBarTintColor: '#453AA4',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'fullScreen',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: '#a75502',
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          },
          headers: {
            'my-custom-header': 'my custom header value'
          }
        })
        //Alert.alert(JSON.stringify(result))

      }
      
      else Linking.openURL(url)
      if (await InAppBrowser.close()) {
        this.getABalance();
      }
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  async gotoTransactions(){
    await AsyncStorage.getItem('customer').then((value) => {
      this.setState({
        customer: JSON.parse(value)
      })
      if(value){
        this.props.navigation.navigate('Transactions')
      }else{
        Alert.alert(
          "Confirm action",
          "You are presntly not logged in. Register or login?",
          [
            {
              text: "No, stay",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "Register/login", onPress: () => this.props.navigation.navigate('Login') }
          ],
          //{ cancelable: false }
        );
      }
    });
  }

  updateProfile(){
    if(!this.state.customer){
      this.showAlert("Error", "Sorry! You are not logged in")
    }
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
    
      this.showLoader();
      fetch(`${SERVER_URL}/mobile/update_profile`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: this.state.customer.id,
            name: this.state.name,
            email: this.state.email,
            phone: this.state.phone,
            currentPassword: this.state.currentPassword,
        })
      }).then((response) => response.json())
          .then((res) => {
            this.hideLoader();
            if(res.success){
              AsyncStorage.setItem('customer', JSON.stringify(res.customer)).then(() => {
                this.showAlert("Success", res.success)
                this.getCustomerFromStorage();
              });
            }else{
              this.showAlert("Error", res.error)
            }
    }).done();
  }

  updatePassword(){
    if(!this.state.customer){
      this.showAlert("Error", "Sorry! You are not logged in")
    }
    if(this.state.password.length < 6){
      Alert.alert("Password must be atleast 6 characters long")
      return;
    }
    if(this.state.password != this.state.cpassword){
      Alert.alert("Provided passwords do not match")
      return;
    }
    
    
      this.showLoader();
      fetch(`${SERVER_URL}/mobile/update_password`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: this.state.customer.user_id,
            password: this.state.password,
            currentPassword1: this.state.currentPassword1,
        })
      }).then((response) => response.json())
          .then((res) => {
            this.hideLoader();
            if(res.success){
                this.showAlert("Success", res.success)
            }else{
              this.showAlert("Error", res.error)
            }
    }).done();
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
  validateEmail(email) 
  {
      var re = /\S+@\S+\.\S+/;
      return re.test(email);
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

  fund(){
    if(!this.state.customer){
      this.showAlert('error', 'Sorry, an unexpected error occured. Kindly logout and login again.')
      
    }else if(this.state.amount == ''){
      this.showAlert('error', 'Ensure you have provided amount.')
    }
    else if(this.state.amount  < 25){
      this.showAlert('error', 'Ensure the amount you provided is at least N25.')
    }
    else{
      console.log('entered', "ent")
      this.setState({
        refresh: true,
        fundVisible: false
      })
      this.openLink();
    }
  }

  logout(){
    AsyncStorage.removeItem('customer');
    this.props.navigation.navigate('Login')
  }


  showAlert(type, message){
    setTimeout(()=>{
      Alert.alert(
        type,
        message,
      );
    },500) 
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

  render() {
    return (
      <View style = {styles.body}>
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}}  colors={['#e2aa2e', '#a75502']} style={styles.headerView}>
          <StatusBar translucent={true}  backgroundColor={'transparent'}  />
          <Text style = {styles.headerText}>Profile</Text>
          <View style={styles.profileRow}>
            <Image source = {require('./imgs/round-profile.png')} style = {styles.roundProfile} />
            <View style={styles.profileCol}>
              <Text style = {styles.profileText}>{this.state.customer && this.state.customer.name}  {!this.state.customer && "Hi, guest"}</Text>
              <Text style = {styles.profileText1}>{this.state.customer && this.state.customer.email}</Text>
            </View>
          </View>
        </LinearGradient>
        <ScrollView style = {styles.sview}>
          <View style={styles.container}>
            <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}}  colors={['rgba(226,170,46, 0.7)', 'rgba(167,85,2, 0.7)']} style={styles.walletView}>
            
              <Text style={styles.walletTitle}>
                Balance
              </Text> 
              
              {this.state.balance &&
              <Text style={styles.walletBalanceText}>
                ₦ {this.state.balance}
              </Text> 
              }
              {!this.state.balance &&
                <ActivityIndicator size="small" color="#ccc" />
              }
              {this.state.refresh &&
              <TouchableOpacity onPress={() => {this.setState({refresh: true}); this.getABalance()}}  style={styles.refreshButton} >
                <Text style={styles.refreshText}>Tap here to refresh balance</Text>
              </TouchableOpacity>
              }
              <TouchableOpacity onPress={() => this.setState({fundVisible: true})}  style={styles.fundButton} >
                <Text style={styles.fundButtonText}>Fund wallet</Text>
              </TouchableOpacity>
              <ImageBackground source = {require('./imgs/back.png')} style = {styles.bImage} ></ImageBackground>
            </LinearGradient>
            <View style = {styles.bottomView}>
              <TouchableOpacity onPress={() => this.toggleUpdate()} style = {styles.cardView}>
                <Image source = {require('./imgs/edit-profile.png')} style = {styles.cardIcon} />
                <Text style = {styles.cardText}>Edit profile</Text>
              </TouchableOpacity>
              {this.state.toggleUpdate &&
              <View>
              <Text style = {styles.label}>Name</Text>
              <TextInput
                          style={styles.input}
                          placeholder=""
                          onChangeText={(text) => this.setState({name: text})}
                          underlineColorAndroid="transparent"
                          value={this.state.name}
                        />
              <Text style = {styles.label}>Email</Text>
              <TextInput
                          style={styles.input}
                          onChangeText={(text) => this.setState({email: text})}
                          underlineColorAndroid="transparent"
                          keyboardType={'email-address'}
                          value={this.state.email}
                        />
              <Text style = {styles.label}>Phone number</Text>
              <TextInput
                          style={styles.input}
                          placeholder=""
                          onChangeText={(text) => this.setState({phone: text})}
                          underlineColorAndroid="transparent"
                          
                          keyboardType={'phone-pad'}
                          value={this.state.phone}
                        />
              <Text style = {styles.label}>Current Password</Text>
              <TextInput
                          style={styles.input}
                          placeholder=""
                          onChangeText={(text) => this.setState({currentPassword: text})}
                          underlineColorAndroid="transparent"
                          
                          secureTextEntry={true}
                        />
              <TouchableOpacity onPress={() => this.updateProfile()}  style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Update</Text>
              </TouchableOpacity>
              <Text style = {styles.label}>Current Password</Text>
              <TextInput
                          style={styles.input}
                          placeholder=""
                          onChangeText={(text) => this.setState({currentPassword1: text})}
                          underlineColorAndroid="transparent"
                          
                          secureTextEntry={true}
                        />
              <Text style = {styles.label}>New Password</Text>
              <TextInput
                          style={styles.input}
                          placeholder=""
                          onChangeText={(text) => this.setState({password: text})}
                          underlineColorAndroid="transparent"
                          
                          secureTextEntry={true}
                        />
              <Text style = {styles.label}>Confirm New Password</Text>
              <TextInput
                          style={styles.input}
                          placeholder=""
                          onChangeText={(text) => this.setState({cpassword: text})}
                          underlineColorAndroid="transparent"
                          maxLength={11}
                          secureTextEntry={true}
                        />
              <TouchableOpacity onPress={() => this.updatePassword()}  style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Update password</Text>
              </TouchableOpacity>
              </View>
              }
              <TouchableOpacity style = {styles.cardView} onPress={() => Linking.openURL('https://airtnd.com/contact')}>
                <Image source = {require('./imgs/about.png')} style = {styles.cardIcon} />
                <Text style = {styles.cardText}>Contact us</Text>
              </TouchableOpacity>
              <TouchableOpacity style = {styles.cardView}  onPress={() => Linking.openURL('https://airtnd.com/terms')}>
                <Image source = {require('./imgs/settings.png')} style = {styles.cardIcon} />
                <Text style = {styles.cardText}>Terms & Policies</Text>
              </TouchableOpacity>
              <TouchableOpacity style = {styles.cardView}  onPress={() => this.logout()}>
                <Image source = {require('./imgs/logout.png')} style = {styles.cardIcon} />
                <Text style = {styles.cardText}>Logout <Text style = {styles.small}> (you are advised to always logout)</Text></Text>
              </TouchableOpacity>
            </View>              
          </View>
        </ScrollView>
        <View style={styles.tabView}>
            <View style={styles.tabTransactionView}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('Transactions')} >
                <Image style={styles.tabIcon} source={require("./imgs/transaction.png")} />
                <Text style={styles.iconText}>Transactions</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tabHomeView}>
              <View style={styles.homeIconView}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Home')} >
                  <Image style={styles.tabIcon} source={require("./imgs/home1.png")} />
                  <Text style={styles.iconText}>Home</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.tabProfileView}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile')} >
                <Image style={styles.tabIcon} source={require("./imgs/profile1.png")} />
                <Text style={styles.iconText}>Profile</Text>
              </TouchableOpacity>
            </View>
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
          isVisible={this.state.fundVisible}
          onBackdropPress={() => {
            this.setState({ fundVisible: false });
          }}
          height= {'100%'}
          width= {'100%'}
          style={styles.modal}
        >
          <View style={styles.forgotModalView}>
          <Text style = {styles.headerText7}>Fund wallet</Text>
          <Text style = {styles.headerText8}>Fund your wallet regularly with as much as you can for special reward</Text>

          <Text style = {styles.label1}>Amount</Text>
              <TextInput
                          style={styles.input1}
                          onChangeText={(text) => this.setState({amount: text})}
                          underlineColorAndroid="transparent"
                          keyboardType={'numeric'}
                          value={this.state.amount}
                        />
          <TouchableOpacity  onPress={() => this.fund()} style={styles.submitButton1}>
          <Text style={styles.submitButtonText}>Fund wallet</Text>
          
        </TouchableOpacity>
          </View>
        </Modal>
      </View>
    )
  }
}

export default Profile

const styles = StyleSheet.create ({
  container: {
    width: '100%',
  },
  body: {
    minHeight: '100%',
    backgroundColor: "#111",
  },
  sview: {
    paddingTop: 90,
    minHeight: '100%',
  },
  headerView: {
    position: 'absolute',
    top: 0,
    zIndex: 9999999999990,
    width: '100%',
    height: 133,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerText: {
  left: 25,
 // position: 'absolute',
  //bottom: 15,
  paddingTop: 40,
  fontSize: 15,
  color: '#fff'
  },
  walletView: {
    width: '90%',
    alignSelf: 'center',
    height: 142,
    marginTop: 55,
    borderRadius: 9,
    paddingTop: 10,
    zIndex: 9999,
    overflow: 'hidden',
    //opacity: 0.7
  },
  walletTitle: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    paddingBottom: 5,
    zIndex: 3,
  },
  walletBalanceText: {
    color: '#fff',
    fontSize: 19,
    textAlign: 'center',
    zIndex: 3,
  },
  mainTitle: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'left',
    paddingBottom: 5,
    paddingLeft: 15,
  },
  mainText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'left',
    paddingLeft: 15,
    maxWidth: '70%'
  },
  fundButton: {
    alignSelf: 'center',
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: "#000",
    marginTop: 18,
    borderRadius: 15,
    zIndex: 999999999999,
  },
  fundButtonText: {
    color: '#fff',
    textAlign: 'center'
  },
  refreshButton: {
    alignSelf: 'center',
    // paddingLeft: 70,
    // paddingRight: 70,
    // paddingTop: 5,
    // paddingBottom: 5,
    // backgroundColor: "#000",
    // marginTop: 18,
    // borderRadius: 15,
    zIndex: 999999999999,
  },
  fundButtonText: {
    color: '#fff',
    textAlign: 'center'
  },
  bImage: {
    width: 155,
    height: 142,
    //alignSelf: 'flex-end',
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    marginLeft: '64%',
  },
  aImage: {
    width: 80,
    alignSelf: 'flex-end',
    zIndex: 99,
    position: 'absolute',
    top: 0,
    marginRight: '5%',
  },
  fundButton: {
    alignSelf: 'center',
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 7,
    paddingBottom: 8,
    backgroundColor: "#000",
    marginTop: 18,
    borderRadius: 15,
  },
  fundButtonText: {
    color: '#fff',
    textAlign: 'center'
  },
   bottomView: {
    width: '90%',
    alignSelf: 'center',
    minHeight: 1050,
   },
   row: {
     flexDirection: 'row'
   },
   col1: {
    width: '50%',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 4,
    backgroundColor: '#444',
    borderRadius: 4,
    marginTop: 20,
    height: 40,
    marginRight: 5
   },
   col2: {
    width: '50%',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 4,
    backgroundColor: '#444',
    borderRadius: 4,
    marginTop: 20,
    height: 40,
    marginLeft: 5
  },
  col11: {
    width: '25%',
    padding: 5
  },
  col12: {
    width: '75%',
    padding: 5
  },
  col21: {
    width: '25%',
    padding: 5
  },
  col22: {
    width: '75%',
    padding: 5
  },
  mobileIcon: {
    width: 17,
    height: 17,
    alignSelf: 'center',
    paddingBottom: 3
  },
  segmentText: {
    color: '#fff',
    //paddingRight: 15,
  },
  checkIcon: {
    width: 22,
    height: 22,
    alignSelf: 'center',
    // paddingBottom: 5,
    // paddingLeft: 15
    position: 'absolute',
    top: -9,
    right: -15
  },
  billerRow: {
    flexDirection: 'row',
    backgroundColor: '#444',
    width: '100%',
    padding: 5,
    marginTop: 5
  },
  billerCol1: {
    width: '25%',
    padding: 5
},
billerCol2: {
  width: '25%',
  padding: 5
},
billerCol3: {
  width: '25%',
  padding: 5
},
billerCol4: {
  width: '25%',
  padding: 5
},
  billerIcon: {
    width: 55,
    height: 55,
    alignSelf: 'center',
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#fff'
    
  },
  label: {
    color: '#fff',
    marginTop: 15
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 5,
    paddingLeft: 25,
    color: '#ccc'
  },
  img:{
    height:20,
    width: 20,
    //alignSelf: 'center'
},
btnView:{
    flexDirection: 'row',
    width: '100%',
},
btn: {
  marginTop: 5,
  width: '33%',
},
submitButton: {
  marginTop: 20,
  backgroundColor: '#e2aa2e',
  borderRadius: 18,
  width: '100%',
  alignSelf: 'center',
  paddingTop: 12,
  paddingBottom: 13,
  marginBottom: 30,
},
submitButtonText: {
  color: '#fff',
  textAlign: 'center'
},
tabView: {
  height: 55,
  width: '100%',
  backgroundColor: '#444',
  flexDirection: 'row',
  position: 'absolute',
  bottom: 0
},
tabTransactionView: {
  width: '33%'
},
tabHomeView: {
  width: '33%'
},
tabProfileView: {
  width: '33%'
},
tabIcon: {
  width: 20,
  height: 20,
  marginTop: 12,
  alignSelf: 'center'
},
iconText: {
  color: '#999',
  fontSize: 9,
  textAlign: 'center'
},
homeIconView: {
  width: 56,
  height: 56,
  borderRadius: 28,
  alignSelf: 'center',
  shadowColor: 'black',
  shadowOpacity: 0.9,
  elevation: 4,
  backgroundColor: '#444',
  alignContent: 'center',
  marginTop: -15
},
cardView: {
  width: '100%',
  alignSelf: 'center',
  padding:10,
  backgroundColor: '#444',
  borderRadius: 2,
  marginTop: 15,
  flexDirection: 'row'
},
cardIcon: {
  width: 18,
  height: 18,
},
cardText: {
  color: '#fff',
  paddingLeft: 25,
  paddingTop: 1,
},
small: {
  fontSize: 10,
},
profileRow: {
  flexDirection: 'row',
  width: '100%',
  paddingLeft: 30,
  marginTop: 14,
},
roundProfile: {
  width: 50,
  height: 50,
},
profileCol: {
  flexDirection: 'column'
},
profileText: {
  color: '#fff',
  paddingLeft: 20,
  paddingTop: 6,
},
profileText1: {
  color: '#fff',
  paddingLeft: 20,
  fontSize: 10,
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
})