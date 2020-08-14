import React, { Component  } from 'react';
import { AppState, View, Text, Alert, Image, Button,ActivityIndicator,PermissionsAndroid, TextInput,BackHandler, StyleSheet, Linking, ScrollView, ImageBackground, StatusBar, TouchableOpacity, AsyncStorage } from 'react-native';
import {NavigationActions} from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import { SERVER_URL } from './config/server';
import Modal from 'react-native-modal';
import { selectContactPhone } from 'react-native-select-contact';

export class Home extends Component {
  constructor(props) {
    super();
    this.handleBackPress = this.handleBackPress.bind(this);
    this.state = {
      radioButtons: ['Option1', 'Option2', 'Option3'],
      checked: 4,
      visible: false,
      billers: false,
      billerItems: false,
      billerId: false,
      loader1: false,
      phone: '',
      amount: '',
      paymentCode: '',
      customer: false,
      contacts: false,
      contacts1: false,
      contactModal: false,
      customer_id: '',
      mtn: false,
      glo: false,
      airtel: false,
      etisalat: false,
    }
    
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

  getPhoneNumber() {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        'title': 'Contacts',
        'message': 'This app would like to view your contacts.',
        'buttonPositive': 'Please accept bare mortal'
      }
    ).then(() => {
      
          return selectContactPhone()
              .then(selection => {
                  if (!selection) {
                      return null;
                  }
                  
                  let { contact, selectedPhone } = selection;
                  console.log(`Selected ${selectedPhone.type} phone number ${selectedPhone.number} from ${contact.name}`);
                  var a = selectedPhone.number.replace(/\s/g,'');
                  var b = a.replace("+234", "0")
                  console.log(b, "b");
                  this.setState({
                    phone: b
                  })
                  //return selectedPhone.number;
              });  
      })
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

  async getAirtimeBillers(){
    //this.showLoader();
    await AsyncStorage.getItem('airtimeBillers').then((value) => {
      if(value){
        this.setState({
          billers:  JSON.parse(value)
        });
      }else{
        fetch(`${SERVER_URL}/mobile/get_airtime_billers`, {
            method: 'GET'
          })
          .then((response) => response.json())
          .then((res) => {
              console.log(res, "billers res");
              //this.hideLoader();
              if(res.success){
                this.setState({
                  billers:  res.success
                }, () => {
                  AsyncStorage.setItem('airtimeBillers', JSON.stringify(res.success)).then(() => {

                  });
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
                { text: "Refresh", onPress: () => this.getAirtimeBillers() }
              ],
              //{ cancelable: false }
            );
        });
      }
    });
 }
 getBillerItems(billerId){
   if(billerId == 109){
    this.setState({
      mtn: true,
      airtel:  false,
      glo:  false,
      etisalat:  false
    })
   }else if(billerId ==901){
    this.setState({
      mtn: false,
      airtel:  true,
      glo:  false,
      etisalat:  false
    })
   }
   else if(billerId ==913){
    this.setState({
      mtn: false,
      airtel: false,
      glo:  true,
      etisalat:  false
    })
   }
   else if(billerId ==908){
    this.setState({
      mtn: false,
      airtel: false,
      glo:  false,
      etisalat:  true
    })
   }
  //this.showLoader();
  this.setState({
    billerId: billerId,
    loader1:  true
  })
  fetch(`${SERVER_URL}/mobile/get_biller_items/${billerId}`, {
       method: 'GET'
    })
    .then((response) => response.json())
    .then((res) => {
      this.setState({
        loader1:  false
      })
        console.log(res, "biller items res");
        //this.hideLoader();
        if(res.success){
          for (let item of res.success) {
            console.log(item, "item");
            if(item.amount == 0){
              this.setState({
                paymentCode:  item.paymentCode
              });
            }
          }
          
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
          { text: "Refresh", onPress: () => this.getBillerItems(billerId) }
        ],
        //{ cancelable: false }
      );
  });
}

 displayBiller(biller){
   if(biller.billerid == 109){
     return(
      <TouchableOpacity key = {biller.billerid} onPress={() => this.getBillerItems(biller.billerid)} style = {styles.billerCol1}>
        <Image source = {require('./imgs/mtn.png')} style = {styles.billerIcon} />
        {this.state.mtn &&
        <Image source = {require('./imgs/check-circle.png')} style = {styles.checkIcon1} />
        }
      </TouchableOpacity>
     )
    }else if(biller.billerid == 901){
      return(
      <TouchableOpacity key = {biller.billerid} onPress={() => this.getBillerItems(biller.billerid)} style = {styles.billerCol2}>
        <Image source = {require('./imgs/airtel.png')} style = {styles.billerIcon} />
        {this.state.airtel &&
        <Image source = {require('./imgs/check-circle.png')} style = {styles.checkIcon1} />
        }
      </TouchableOpacity>
      )
    }
    else if(biller.billerid == 913){
      return(
        <TouchableOpacity key = {biller.billerid} onPress={() => this.getBillerItems(biller.billerid)} style = {styles.billerCol3}>
        <Image source = {require('./imgs/glo.png')} style = {styles.billerIcon} />
        {this.state.glo &&
        <Image source = {require('./imgs/check-circle.png')} style = {styles.checkIcon1} />
        }
        </TouchableOpacity>
      )
    }
    else if(biller.billerid == 908){
      return(
      <TouchableOpacity key = {biller.billerid} onPress={() => this.getBillerItems(biller.billerid)} style = {styles.billerCol4}>
      <Image source = {require('./imgs/9mobile.png')} style = {styles.billerIcon} />
      {this.state.etisalat &&
        <Image source = {require('./imgs/check-circle.png')} style = {styles.checkIcon1} />
        }
      </TouchableOpacity>
      )
   }
 }

  componentDidMount() {
    this.getAirtimeBillers();
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
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

  gotoAirtimeConfirmPage(){

    if(this.state.billerId == false){
      this.showAlert('error', 'Kindly select a network');
      return;
    }
    if(this.state.phone.length != 11){
      this.showAlert('error', 'Kindly ensure mobile number is provided and in thr folowing format: 08012345678');
      return;
    }
    

    
    if(this.state.paymentCode == ''){
      this.showAlert('error', 'Kindly reselect network');
      return;
    }
    this.props.navigation.navigate('AirtimeConfirm', {
      billerId: this.state.billerId,
      phone: this.state.phone,
      amount: this.state.amount,
      paymentCode: this.state.paymentCode,
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
      <View style={styles.body}>
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}}  colors={['#e2aa2e', '#a75502']} style={styles.headerView}>
          <StatusBar translucent={true}  backgroundColor={'transparent'}  />
          <Text style = {styles.headerText}>Home</Text>
        </LinearGradient>
        <ScrollView>
          <View style={styles.container}>
            <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}}  colors={['rgba(226,170,46, 0.7)', 'rgba(167,85,2, 0.7)']} style={styles.walletView}>
            
              <Text style={styles.mainTitle}>
                Check for bonus!
              </Text> 
              <TouchableOpacity style = {styles.cardView}  onPress={() => Linking.openURL('https://airtnd.com/bonus')}>
                <Text style={styles.mainText}>
                Select a checkbox for airtnd bonuses (Learn more)
                </Text> 
              </TouchableOpacity>
              <Image source = {require('./imgs/2.png')} style = {styles.aImage} />
              <Image source = {require('./imgs/1.png')} style = {styles.bImage} />
            </LinearGradient>
            <View style = {styles.bottomView}>
              <View style={styles.btnView}>
              
              {this.state.radioButtons.map((data, key) => {
                return (
                <View key={key} style={styles.btn}>
                  {this.state.checked == key ?
                    <TouchableOpacity >
                        <Image style={styles.img} source={require("./imgs/selected.png")}/>
                        
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={()=>{this.setState({checked: key})}} >
                        <Image style={styles.img} source={require("./imgs/unselected.png")} />
                        
                    </TouchableOpacity>
                  }
                </View>
                )
              })}
              </View>
              <View  style = {styles.row}>
                <View  style = {styles.col1}>
                  <View  style = {styles.row}>
                    <View  style = {styles.col11}>
                      <Image source = {require('./imgs/mobile1.png')} style = {styles.mobileIcon} />
                    </View>
                    <View  style = {styles.col12}>
                      <Text style = {styles.segmentText}>Airtime Topup</Text>
                      <Image source = {require('./imgs/check-circle.png')} style = {styles.checkIcon} />
                    </View>
                  </View>
                </View>
                <View  style = {styles.col2}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Data')} style = {styles.row}>
                    <View  style = {styles.col21}>
                      <Image source = {require('./imgs/mobile2.png')} style = {styles.mobileIcon} />
                    </View>
                    <View  style = {styles.col22}>
                      <Text style = {styles.segmentText}>Data bundle</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style = {styles.label}>Select network</Text>
              <View  style = {styles.billerRow}>
              {this.state.billers && this.state.billers.map(biller => (
                
                  this.displayBiller(biller)
                
              ))}
              {!this.state.billers &&
              <ActivityIndicator size="small" color="#ccc" />
                }
              </View>
              {this.state.loader1 &&
                <ActivityIndicator size="small" color="#ccc" />
                }
              <Text style = {styles.label}>Phone number</Text>
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TextInput
                            style={styles.inputz}
                            placeholder="08012345678"
                            onChangeText={(text) => this.setState({phone: text})}
                            underlineColorAndroid="transparent"
                            maxLength={11}
                            keyboardType={'phone-pad'}
                            value={this.state.phone}
                          />
                  <TouchableOpacity onPress={() => this.getPhoneNumber()}  style={styles.contactButton}>
                  <Image source = {require('./imgs/contact.png')} style = {styles.mobileIcon1} />
                </TouchableOpacity>
              </View>
              <Text style = {styles.label}>Amount</Text>
              <TextInput
                          style={styles.input}
                          placeholder="Amount"
                          onChangeText={(text) => this.setState({amount: text})}
                          underlineColorAndroid="transparent"
                          maxLength={11}
                          keyboardType={'numeric'}
                        />
              
              <TouchableOpacity onPress={() => this.gotoAirtimeConfirmPage()}  style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Proceed</Text>
              </TouchableOpacity>
            </View>
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
                  <Image style={styles.tabIcon} source={require("./imgs/home.png")} />
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
        
      </View>
    )
  }
}

export default Home

const styles = StyleSheet.create ({
  container: {
    width: '100%',
    minHeight: '100%',
    zIndex: 1,
    backgroundColor: "#111",
    marginTop: 90,
  },
  body: {
    backgroundColor: "#111",
    minHeight: '100%',
  },
  headerView: {
    position: 'absolute',
    top: 0,
    zIndex: 9999999999,
    width: '100%',
    height: 90,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#111',
  },
  headerText: {
  left: 25,
  position: 'absolute',
  bottom: 10,
  fontSize: 15,
  color: '#fff'
  },
  contactItemView: {
    marginTop: 12,
    width: '100%',
    flexDirection: 'row',
    //marginLeft: 30,
  },
  userView: {
    width: '15%'
  },
  userIcon: {
    width: 50,
    height: 50
  },
  otherView: {
    width: '75%'
  },
  numberView: {
    flexDirection: 'row',
    width: '100%'
  },
  contactButton1: {
    marginRight: 10,
  },
  walletView: {
    width: '90%',
    alignSelf: 'center',
    height: 102,
    marginTop: 15,
    borderRadius: 9,
    paddingTop: 10,
    zIndex: 8
    //opacity: 0.7
  },
  walletTitle: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    paddingBottom: 5,
  },
  walletBalanceText: {
    color: '#fff',
    fontSize: 19,
    textAlign: 'center'
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
    paddingLeft: 70,
    paddingRight: 70,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: "#000",
    marginTop: 18,
    borderRadius: 15,
  },
  fundButtonText: {
    color: '#fff',
    textAlign: 'center'
  },
  bImage: {
    width: 80,
    alignSelf: 'flex-end',
    zIndex: 99,
    position: 'absolute',
    bottom: 0,
    marginRight: '5%',
  },
  aImage: {
    width: 80,
    alignSelf: 'flex-end',
    zIndex: 99,
    position: 'absolute',
    top: 0,
    marginRight: '5%',
  },
   bottomView: {
    width: '90%',
    alignSelf: 'center',

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
    marginTop: 1,
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
    marginTop: 1,
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
  
  mobileIcon1: {
    width: 17,
    height: 20,
    alignSelf: 'center',
    paddingBottom: 3,
    //backgroundColor: '#fff',
    //padding: 12,
    //borderRadius: 9,
  },
  segmentText: {
    color: '#fff',
    //paddingRight: 15,
  },
  checkIcon1: {
    width: 22,
    height: 22,
    alignSelf: 'center',
    // paddingBottom: 5,
    // paddingLeft: 15
    position: 'absolute',
    top: -9,
    right: -1
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
    borderColor: '#777',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 5,
    color: '#aaa',
  },
  inputz: {
    width: '85%',
    height: 40,
    borderColor: '#777',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 5,
    color: '#aaa',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingTop: 10,
    marginTop: 5,
    marginLeft: 3,
    
  },
  img:{
    height:50,
    width: 50,
    alignSelf: 'center'
},
btnView:{
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
    alignContent: 'center',
    alignItems: 'center',
},
btn: {
  marginTop: 5,
  marginBottom: 12,
  width: '33%',
  alignSelf: 'center'
},
submitButton: {
  marginTop: 20,
  backgroundColor: '#e2aa2e',
  borderRadius: 18,
  width: '100%',
  alignSelf: 'center',
  paddingTop: 12,
  paddingBottom: 13,
  marginBottom: 80,
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
  height: 100,
  width: '100%',
  //paddingTop: '40%'
},
empty: {
  width: '25%',
  alignContent: 'center',
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
  height: '70%',
  width: '90%',
  backgroundColor: '#FFF',
  paddingTop: 18,
  paddingLeft: 15,
  overflow: 'hidden',
  paddingBottom: 30,
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
  color: '#00f',
  paddingLeft: 20,
  fontSize: 12
},

})