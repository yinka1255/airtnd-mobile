import React, { Component  } from 'react';
import { AppState, View, Text, Alert, Image, Dimensions, Button, BackHandler,ActivityIndicator, TextInput, StyleSheet, ScrollView, ImageBackground, StatusBar, TouchableOpacity, AsyncStorage } from 'react-native';
import {NavigationActions} from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
const { Height } = Dimensions.get('window');
import { SERVER_URL } from './config/server';
import Modal from 'react-native-modal';
import { WebView } from 'react-native-webview';
import { Linking } from 'react-native'
import InAppBrowser from 'react-native-inappbrowser-reborn'

export class AirtimeConfirm extends Component {
  constructor(props) {
    super();
    this.handleBackPress = this.handleBackPress.bind(this);
    this.state = {
      server_url: SERVER_URL,
      radioButtons: ['Option1', 'Option2', 'Option3'],
      checked: 0,
      visible: false,
      myParams: props.navigation.state.params,
      payWithWallet: true,
      payWithCard: false,
      customer: false,
      customer_id: 'guest',
      fundVisible: false,
      fundAmount: '',
    }
    this.getLoggedInUser();
    //const {params} = props.navigation.state;
  }

  async componentDidMount() {
    
    console.log(this.state.myParams);
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress = () => {
    this.props.navigation.navigate('Home');
    return true
  }

  async openLink1() {
    try {
      const url = `${this.state.server_url}/mobile/fund_wallet_online/${this.state.customer.id}/${this.state.fundAmount}`
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
      
    } catch (error) {
      setTimeout(()=>{
        Alert.alert(error.message)
      },500)
    }
  }

  async openLink() {
    try {
      const url = `${this.state.server_url}/mobile/pay_airtime_online/${this.state.myParams.paymentCode}/${this.state.myParams.amount}/${this.state.myParams.phone}/${this.state.customer_id}/Airtime`
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'close',
          preferredBarTintColor: '#453AA4',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'overFullScreen',
          modalTransitionStyle: 'partialCurl',
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
    } catch (error) {
      setTimeout(()=>{
        Alert.alert(error.message)
      },500)
    }
  }

  payWithWalletExec(){
      this.showLoader();
      if(this.state.customer){
        var customer_id = this.state.customer.id;
      }else{
        var customer_id = 'guest';
      }
      fetch(`${SERVER_URL}/mobile/pay_airtime_wallet`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            payment_item: this.state.myParams.paymentCode,
            phone: this.state.myParams.phone,
            amount: this.state.myParams.amount,
            customer_id: this.state.customer_id,
        })
      }).then((response) => response.json())
          .then((res) => {
            this.hideLoader();
            if(res.success){
              //AsyncStorage.setItem('customer', JSON.stringify(res.customer)).then(() => {
                this.showAlert("success", res.success)
              //});
            }
            else if(res.error1){
              setTimeout(()=>{
                Alert.alert(
                  "Response",
                  res.error1 + " Fund your wallet now?",
                  [
                    {
                      text: "No",
                      onPress: () => console.log("Cancel Pressed"),
                      style: "cancel"
                    },
                    { text: "Fund now", onPress: () => this.setState({fundVisible: true})}
                  ],
                  //{ cancelable: false }
                );
              },500)
            }
            else{
              this.showAlert("Error", res.error)
            }
    }).done();
  }
  
  async gotoPofile(){
    await AsyncStorage.getItem('customer').then((value) => {
        this.setState({
          customer: JSON.parse(value)
        })
        if(value){
          this.props.navigation.navigate('Profile')
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
  async getLoggedInUser(){
    await AsyncStorage.getItem('customer').then((value) => {
      console.log(JSON.parse(value));
      if(value){
        this.setState({
          customer: JSON.parse(value)
        }, () => {
          this.setState({
            customer_id: this.state.customer.id
          })
        });
          
      }else{
      
      }
    });
  }

  displayBiller(biller){
    if(biller.billerId == 109){
      return(
         <Image source = {require('./imgs/mtn.png')} style = {styles.billerIcon} />
      )
     }else if(biller.billerId == 901){
       return(
      <Image source = {require('./imgs/airtel.png')} style = {styles.billerIcon} />
       )
     }
     else if(biller.billerId == 913){
       return(
         <Image source = {require('./imgs/glo.png')} style = {styles.billerIcon} />
       )
     }
     else if(biller.billerId == 908){
       return(
       <Image source = {require('./imgs/9mobile.png')} style = {styles.billerIcon} />
       )
    }
  }

  proceed(){
    if(this.state.payWithCard == true){
      this.openLink();
      
    }else if(this.state.payWithWallet == true){
      this.payWithWalletExec();
    }else{
      this.showAlert('error', 'Kindly select method of payment')
    }
  }

  fund(){
    if(!this.state.customer){
      this.showAlert('error', 'Sorry, an unexpected error occured. Kindly logout and login again.')
      
    }else if(this.state.fundAmount == ''){
      this.showAlert('error', 'Ensure you have provided amount.')
    }
    else if(this.state.fundAmount  < 25){
      this.showAlert('error', 'Ensure the amount you provided is at least N25.')
    }
    else{
      this.setState({ fundVisible: false }, () => {
        setTimeout(()=>{
          this.openLink1();
        },500)
      });
    }
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
  showAlert(type, message){
    setTimeout(()=>{
      Alert.alert(
        type,
        message,
      );
    },500) 
  }

  render() {
    return (
      <View style = {styles.body}>
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}}  colors={['#e2aa2e', '#a75502']} style={styles.headerView}>
          <StatusBar translucent={true}  backgroundColor={'transparent'}  />
          <View style= {styles.hView}>
          <Text style = {styles.headerText}>Airtime Topup</Text>
          <TouchableOpacity style = {styles.backView}  onPress={() => this.props.navigation.navigate('Home')}>
          <Text style = {styles.back}>Back</Text>
          </TouchableOpacity>
          </View>
        </LinearGradient>
        <ScrollView style = {styles.sview}>
          <View style={styles.container}>
            
            <View style = {styles.top1View}>
              <View  style = {styles.topRow}>
                <View  style = {styles.col1}>
                  <Text style = {styles.top1Text}>Mobile number</Text>
                </View>
                <View  style = {styles.col2}>
                  <Text style = {styles.top1Text}>{this.state.myParams.phone}</Text>
                </View>
              </View>
              <View  style = {styles.topRow}>
                <View  style = {styles.col1}>
                  <Text style = {styles.top1Text}>Network</Text>
                </View>
                <View  style = {styles.col2}>
                  {this.displayBiller(this.state.myParams)}
                </View>
              </View>
            </View>
            
            <View style = {styles.top11View}>
              <Text style = {styles.label}>Would you like to Change amount</Text>
              <View style = {styles.amountRow}>
                <TouchableOpacity style = {styles.amountCol}  onPress={() => this.setState({myParams: {amount: '100'}})} >
                <Text style = {styles.amountText}>₦100.00</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.amountCol}  onPress={() => this.setState({myParams: {amount: '200'}})}>
                <Text style = {styles.amountText}>₦200.00</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.amountCol}  onPress={() => this.setState({myParams: {amount: '500'}})}>
                <Text style = {styles.amountText}>₦500.00</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.amountCol}  onPress={() => this.setState({myParams: {amount: '1000'}})}>
                <Text style = {styles.amountText}>₦1000.00</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TextInput
                          style={styles.amountInput}
                          placeholder="Amount"
                          onChangeText={(text) => this.setState({myParams: {amount: text}})}
                          underlineColorAndroid="transparent"
                          maxLength={11}
                          value={this.state.myParams.amount}
                          keyboardType={'numeric'}
                        />
            {/*
            <TouchableOpacity style = {styles.cardView}   onPress={() => this.setState({payWithWallet: false, payWithCard: true})} >
              <Image source = {require('./imgs/card.png')} style = {styles.cardIcon} />
              <Text style = {styles.cardText}>Pay with card</Text>
              {this.state.payWithCard &&
              <Image source = {require('./imgs/check-circle.png')} style = {styles.checkIcon} />
              }
            </TouchableOpacity>
            */}
            <TouchableOpacity style = {styles.cardView}  onPress={() => this.setState({payWithCard: false, payWithWallet: true})}>
              <Image source = {require('./imgs/wallet.png')} style = {styles.cardIcon} />
              <Text style = {styles.cardText}>Pay from wallet</Text>
              {this.state.payWithWallet &&
              <Image source = {require('./imgs/check-circle.png')} style = {styles.checkIcon} />
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.proceed()}  style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Proceed</Text>
              </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={styles.tabView}>
            <View style={styles.tabTransactionView}>
              <TouchableOpacity onPress={() => this.gotoTransactions()} >
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
              <TouchableOpacity onPress={() => this.gotoPofile()} >
                <Image style={styles.tabIcon} source={require("./imgs/profile.png")} />
                <Text style={styles.iconText}>Profile</Text>
              </TouchableOpacity>
            </View>
        </View>
        
        <Modal
          isVisible={this.state.visible}
          
          onBackdropPress={() =>  this.setState({ visible: false })}
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
                          onChangeText={(text) => this.setState({fundAmount: text})}
                          underlineColorAndroid="transparent"
                          keyboardType={'numeric'}
                          value={this.state.fundAmount}
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

export default AirtimeConfirm

const styles = StyleSheet.create ({
  container: {
    width: '100%',
    //height: '100%',
    //zIndex: 1,
    //backgroundColor: "#111",
    
  },
  headerView: {
    position: 'absolute',
    top: 0,
    zIndex: 9999999999,
    width: '100%',
    height: 90,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  sview: {
    paddingTop: 90,
    minHeight: '100%',
    backgroundColor: "#111",
    paddingBottom: 360
  },
  body: {
    minHeight: '100%',
    backgroundColor: "#111",
  },
  headerText: {
    paddingLeft: 20,
    fontSize: 15,
    color: '#fff',
    width: '50%'
    },
  
   row: {
     flexDirection: 'row'
   },
   col1: {
    width: '50%',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
    //marginTop: 5,
   },
   col2: {
    width: '50%',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
  },
  billerIcon: {
    width: 25,
    height: 25,
  },
  top11View: {
    width: '90%',
    alignSelf: 'center',
  },
  
  top1View: {
    backgroundColor: '#444',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 5,
    padding: 5,
    marginTop: 15,
    paddingBottom: 10
  },
  top1Text: {
    color: '#fff'
  },
  topRow: {
    flexDirection: 'row',
  },
  hView: {
    flexDirection: 'row',
    width: '100%',
      position: 'absolute',
      bottom: 15,
    },
  backView: {
    width: '50%',
    alignContent: 'flex-end'
  },  
  back: {
    fontSize: 14,
    paddingRight: 20,
    textAlign: 'right',
    //width: '40%',
    alignSelf: 'flex-end'
  },  
  label: {
    color: '#fff',
    marginTop: 15
  },
  backIcon: {
    width: 30,
    marginLeft: 30,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#777',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 5,
  },
  amountInput: {
    width: '75%',
    alignSelf: 'center',
    padding:10,
    borderColor: '#777',
    borderWidth: 1,
    marginTop: 20,
    color: '#eee',
    textAlign: 'center'
  },
  img:{
    height:20,
    width: 20,
    //alignSelf: 'center'
},

submitButton: {
  marginTop: 20,
  backgroundColor: '#e2aa2e',
  borderRadius: 18,
  width: '100%',
  width: '90%',
  alignSelf: 'center',
  paddingTop: 12,
  paddingBottom: 13,
  marginBottom: 50,
},
submitButtonText: {
  color: '#fff',
  textAlign: 'center'
},
top2View: {
  width: '75%',
  alignSelf: 'center',
  padding:10,
  borderColor: '#777',
  borderWidth: 1,
  marginTop: 30
},
top2Text: {
  color: '#fff',
  textAlign: 'center',

},
cardView: {
  width: '90%',
  alignSelf: 'center',
  padding:10,
  backgroundColor: '#444',
  borderRadius: 2,
  marginTop: 15,
  flexDirection: 'row'
},
cardIcon: {
  width: 25,
  height: 25,
},
cardText: {
  color: '#fff',
  paddingLeft: 25,
  paddingTop: 5,
},
amountRow: {
  flexDirection: 'row',
  marginTop: 5,
  alignContent: 'center'
},
amountCol: {
  padding: 7,
  borderRadius: 8,
  borderColor: '#e2aa2e',
  borderWidth: 1,
  width: '22%',
  margin: 3
},
amountText: {
  color: '#e2aa2e',
  fontSize: 12,
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
checkIcon: {
  width: 22,
  height: 22,
  alignSelf: 'center',
  // paddingBottom: 5,
  // paddingLeft: 15
  position: 'absolute',
  top: -15,
  right: -20
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
  //paddingTop: '40%'
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