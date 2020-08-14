import React, { Component  } from 'react';
import { AppState, View, Text, Alert, Image, Button, Dimensions,ActivityIndicator, TextInput, StyleSheet, ScrollView, ImageBackground, StatusBar, TouchableOpacity, AsyncStorage } from 'react-native';
import {NavigationActions} from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
const { Height } = Dimensions.get('window')
import { SERVER_URL } from './config/server';

export class Transactions extends Component {
  constructor(props) {
    super();
    this.state = {
      radioButtons: ['Option1', 'Option2', 'Option3'],
      checked: 0,
      index1: true,
      index2: false,
      index3: false,
      visible: false,
      background1: '#e2aa2e',
      background2: 'transparent',
      background3: 'transparent',
      walletTopup: false,
      airtimeTopup: false,
      dataTopup: false,
      customer: '',
      wTotal: false,
      aTotal: false,
      dTotal: false,
    }
    this.getCustomerFromStorage();
    //this.getTransactions();
  }

  async componentDidMount() {
    
  }

  async getCustomerFromStorage(){
    await AsyncStorage.getItem('customer').then((value) => {
      var d = JSON.parse(value);
      console.log(value, "aa");
      this.setState({
        customer: d,

      }, () => {
        this.getTransactions();
        });
    });
  }
  
  changeView(index){
    if(index == 1){
      this.setState({
        index1: true,
        index2: false,
        index3: false,
        background1: '#e2aa2e',
        background2: 'transparent',
        background3: 'transparent'
      })
    }
    if(index == 2){
      this.setState({
        index1: false,
        index2: true,
        index3: false,
        background1: 'transparent',
        background2: '#e2aa2e',
        background3: 'transparent'
      })
    }
    if(index == 3){
      this.setState({
        index1: false,
        index2: false,
        index3: true,
        background1: 'transparent',
        background2: 'transparent',
        background3: '#e2aa2e'
      })
    }
  }

  async getTransactions(){
    this.showLoader();
    fetch(`${SERVER_URL}/mobile/get_transactions/${this.state.customer.id}`, {
         method: 'GET'
      })
      .then((response) => response.json())
      .then((res) => {
          this.hideLoader();
          console.log(res, 'res');
          if(res.wallet_topup.length > 0){
            this.setState({
              walletTopup:  res.wallet_topup,
            }, () => {
              if(res.wallet_topup.reduce(function (a, b) { return parseFloat(a) + parseFloat(b.amount); }, 0) == 0){
                this.setState({
                  wTotal:  '0',
                });
              }else{
                this.setState({
                  wTotal:  res.wallet_topup.reduce(function (a, b) { return parseFloat(a) + parseFloat(b.amount); }, 0),
                });
              }
            });
          }
          if(res.airtime_topup.length > 0){
            this.setState({
              airtimeTopup:  res.airtime_topup,
            }, () => {
              this.setState({
                aTotal:  res.airtime_topup.reduce(function (a, b) { return parseFloat(a) + parseFloat(b.amount); }, 0),
              });
            });
          }
          if(res.data_topup.length > 0){
            this.setState({
              dataTopup:  res.data_topup
            }, () => {
              this.setState({
                dTotal:  res.data_topup.reduce(function (a, b) { return parseFloat(a) + parseFloat(b.amount); }, 0),
              });
            });
          }
          
      })
      .catch((error) => {
         console.error(error);
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
          <Text style = {styles.headerText}>Transactions</Text>
        </LinearGradient>
        <ScrollView style = {styles.sview}>
          <View style={styles.container}>
            <View style = {styles.bottomView}>
              <View  style = {styles.row}>
                <TouchableOpacity onPress={() => this.changeView(1)}  style = {[styles.col1, {backgroundColor: this.state.background1}]}>
                  <Text style={styles.segmentText}>Wallet topup</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.changeView(2)}  style = {[styles.col2, {backgroundColor: this.state.background2}]}>
                  <Text style={styles.segmentText}>Airtime topup</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.changeView(3)}  style = {[styles.col3, {backgroundColor: this.state.background3}]}>
                  <Text style={styles.segmentText}>Data topup</Text>
                </TouchableOpacity>
              </View>
              {this.state.index1 && 
                <View  style = {styles.index1}>
                  <View  style = {styles.item6}>
                      <Text style={styles.itemText6}>Total: ₦ 
                      {this.state.wTotal &&
                        <Text>{this.state.wTotal}</Text>
                      }
                        .00
                        </Text>
                      
                      {!this.state.wTotal &&
                      <ActivityIndicator size="small" color="#ccc" />
                        }
                  </View>

                  {this.state.walletTopup && this.state.walletTopup.map(wTopup => (
                  <View  style = {styles.item}>
                    <View style = {styles.itemCol1}>
                    <Text style={styles.itemText}>{wTopup.description}</Text>
                    <Text style={styles.itemText}>₦ {wTopup.amount}.00</Text>
                    </View>
                    <View style = {styles.itemCol2}>
                    <Text format="YYYY/MM/DD" tyle={styles.itemText1}>{wTopup.created_at} </Text>
                    </View>
                  </View>
                  ))}
                </View>
              }

              {this.state.index2 && 
                <View  style = {styles.index1}>
                  <View  style = {styles.item6}>
                      <Text style={styles.itemText6}>Total: ₦ {this.state.aTotal}.00</Text>
                    
                  </View>
                  {this.state.airtimeTopup && this.state.airtimeTopup.map(aTopup => (
                  <View  style = {styles.item}>
                    <View style = {styles.itemCol1}>
                    <Text style={styles.itemText}>{aTopup.description}</Text>
                    <Text style={styles.itemText}>₦ {aTopup.amount}.00</Text>
                    </View>
                    <View style = {styles.itemCol2}>
                    <Text format="YYYY/MM/DD" tyle={styles.itemText1}>{aTopup.created_at} </Text>
                    </View>
                  </View>
                  ))}
                </View>
              }
              {this.state.index3 && 
                <View  style = {styles.index1}>
                  <View  style = {styles.item6}>
                      <Text style={styles.itemText6}>Total: ₦ {this.state.dTotal}.00</Text>
                    
                  </View>
                  {this.state.dataTopup &&  this.state.dataTopup.map(dTopup => (
                  <View  style = {styles.item}>
                    <View style = {styles.itemCol1}>
                    <Text style={styles.itemText}>{dTopup.description}</Text>
                    <Text style={styles.itemText}>₦ {dTopup.amount}.00</Text>
                    </View>
                    <View style = {styles.itemCol2}>
                    <Text format="YYYY/MM/DD" tyle={styles.itemText1}>{dTopup.created_at} </Text>
                    </View>
                  </View>
                  ))}
                </View>
              }
            </View>
          </View>
        </ScrollView>
        <View style={styles.tabView}>
          <View style={styles.tabTransactionView}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Transactions')} >
              <Image style={styles.tabIcon} source={require("./imgs/transaction1.png")} />
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
              <Image style={styles.tabIcon} source={require("./imgs/profile.png")} />
              <Text style={styles.iconText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

export default Transactions

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
    zIndex: 9999999999,
    width: '100%',
    height: 90,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerText: {
  left: 25,
  position: 'absolute',
  bottom: 10,
  fontSize: 15,
  color: '#fff'
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
row: {
  width: '90%',
  alignSelf: 'center',
  borderWidth: 1,
  borderColor: '#999',
  borderRadius: 18,
  flexDirection: 'row',
  marginTop: 20,
},
segmentText: {
  color: '#fff',
  fontSize: 12,
  paddingTop: 6,
  paddingBottom: 7,
  textAlign: 'center'

},
col1: {
  width: '33%',
  borderRadius: 18,
},
col2: {
  width: '33%',
  borderRadius: 18,

},
col3: {
  width: '33%',
  borderRadius: 18,
},
index1: {
  width: '100%',
  marginTop: 20.
},
item: {
  flexDirection: 'row',
  width: '90%',
  alignSelf: 'center',
  backgroundColor: '#444',
  paddingTop: 8,
  paddingBottom: 8,
  marginBottom: 10,
},
item6: {
  //flexDirection: 'row',
  width: '90%',
  alignSelf: 'center',
  alignContent: 'center',
  backgroundColor: '#aaa',
  paddingTop: 8,
  paddingBottom: 7,
  marginBottom: 10,
},
itemText6: {
  textAlign: 'center',
  paddingBottom: 5,
  color: '#000',
  fontSize: 15
},
itemCol1: {
  width: '70%',
},
itemCol2: {
  width: '30%',
},
itemText: {
  paddingLeft: 25,
  paddingBottom: 5,
  color: '#fff',
  fontSize: 12
},
itemText1: {
  paddingTop: 12,
  color: '#fff',
  fontSize: 12
}

})