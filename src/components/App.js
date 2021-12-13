import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import IERC20 from '../abis/IERC20.json'
import Presale from '../abis/BlaqPresale.json'
import gif from '../gif.gif';
import * as s from "../styles/globalStyles";
import GaugeChart from 'react-gauge-chart'
import { Container } from 'react-bootstrap';

class App extends Component {
  
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = 137 === networkId
    if(networkData) {
      const presale = new web3.eth.Contract(Presale.abi, "0x28A58961A439DDd49a07Ca87B46e0039e77f7D2c")
      this.setState({presale})
      const usdc = new web3.eth.Contract(IERC20.abi, "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174")
      this.setState({usdc})
      const usdt = new web3.eth.Contract(IERC20.abi, "0xc2132D05D31c914a87C6611C10748AEb04B58e8F")
      this.setState({usdt})
      const wmatic = new web3.eth.Contract(IERC20.abi, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270")
      this.setState({wmatic})
      const appValue = "10000000000000000000000000000000000000000000000000000000000000000";
      this.setState({appValue})
      var tokensSold = 0;
      await this.state.presale.methods._tokensSold().call({from: this.state.account}).then(function(result){
        tokensSold = result;
      })
      this.setState({tokensSold})

      var currentRound = 0;
      await this.state.presale.methods._currentRound().call({from: this.state.account}).then(function(result){
        currentRound = result;
      })
      this.setState({currentRound})

      var leftInRound = 0;
      await this.state.presale.methods._rounds(this.state.currentRound).call({from: this.state.account}).then(function(result){
        leftInRound = result._tokensLeft
      })
      this.setState({leftInRound})
      
      var leftInRoundPercent = leftInRound / 1250
      this.setState({leftInRoundPercent})

      var userVested = 1;
      await this.state.presale.methods.viewVestedTokens(this.state.account).call({from: this.state.account}).then(function(result){
        userVested = web3.utils.fromWei(result, 'ether')
      })
      this.setState({userVested})

      var usdcApproved = 0;
      await this.state.usdc.methods.allowance(this.state.account, "0x28A58961A439DDd49a07Ca87B46e0039e77f7D2c").call().then(function(result){
        usdcApproved = web3.utils.fromWei(result, 'ether')
      })
      this.setState({usdcApproved})
      
      var usdtApproved = 0;
      await this.state.usdt.methods.allowance(this.state.account, "0x28A58961A439DDd49a07Ca87B46e0039e77f7D2c").call().then(function(result){
        usdtApproved = web3.utils.fromWei(result, 'ether')
      })
      this.setState({usdtApproved})
     
      var wmaticApproved = 0;
      await this.state.wmatic.methods.allowance(this.state.account, "0x28A58961A439DDd49a07Ca87B46e0039e77f7D2c").call().then(function(result){
        wmaticApproved = web3.utils.fromWei(result, 'ether')
      })
      this.setState({wmaticApproved})
     
    } else {
      window.alert('You are not connected to the Polygon network.')
    }
  }

  approveUsdc = description => {
    console.log("Approving USDC")
    this.state.usdc.methods.approve("0x28A58961A439DDd49a07Ca87B46e0039e77f7D2c", this.state.appValue).send({ from: this.state.account })
  }

  approveUsdt = description => {
    console.log("Approving USDT")
    this.state.usdt.methods.approve("0x28A58961A439DDd49a07Ca87B46e0039e77f7D2c", this.state.appValue).send({ from: this.state.account })
  }

  approveWMatic = description => {
    console.log("Approving WMatic")
    this.state.wmatic.methods.approve("0x28A58961A439DDd49a07Ca87B46e0039e77f7D2c", this.state.appValue).send({ from: this.state.account })
  }

  buyUsdc = description => {
    console.log(this.state.message)
    this.state.presale.methods.buyWithUsdc(this.state.message).send({from: this.state.account})

  }
  
  buyUsdt = description => {
    console.log(this.state.appValue)
    this.state.presale.methods.buyWithUsdt(this.state.message).send({from: this.state.account})
  }

  buyWMatic = description => {
    console.log(this.state.appValue)
    this.state.presale.methods.buyWithWMatic(this.state.message).send({from: this.state.account})
  }

  claim = description => {
    this.state.presale.methods.claim().send({from: this.state.account})
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      loading: true,
      appValue: 0,
      message: 0
    }

    this.claim = this.claim.bind(this)
    this.approveUsdc = this.approveUsdc.bind(this)
    this.approveUsdt = this.approveUsdt.bind(this)
    this.approveWMatic = this.approveWMatic.bind(this)
    this.buyUsdc = this.buyUsdc.bind(this)
    this.buyUsdt = this.buyUsdt.bind(this)
    this.buyWMatic = this.buyWMatic.bind(this)

  }
  state = {message: '3'};

  updateNumber = (e) => {
    const val = e.target.value;
    // If the current value passes the validity test then apply that to state
    if (e.target.validity.valid) this.setState({message: e.target.value}); 
    // If the current val is just the negation sign, or it's been provided an empty string,
    // then apply that value to state - we still have to validate this input before processing
    // it to some other component or data structure, but it frees up our input the way a user
    // would expect to interact with this component
    else if (val === '' || val === '-') this.setState({message: val});
  }
  render() {
    return (
      
      <div  className='App'>
      
      <div >
        
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            BLAQ Presale
          </a>
          
        </nav>
        <center>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 text-center">
              
              <div className="content mr-auto ml-auto">
               
                  <img src={gif} className="App-logo" alt="logo" />
                  
                
                <h1>Blaq Token Presale</h1>
                <p>
                  Purchase Blaq Tokens for USDC, USDT or wMatic
                </p>

                  
                <s.SpacerXSmall/>
                <p>
                  You have purchased {this.state.userVested} tokens that are currently vesting.
                </p>
                <input
                    type='tel'
                    placeholder="0"
                    value={this.state.message}
                    onChange={this.updateNumber}
                    pattern="^-?[0-9]\d*\.?\d*$"
                    />
                  <s.SpacerXSmall />
                <button  className='buy-button'  style={{height: '50px', width : '200px'}}
                      
                      onClick={(e) => {
                        e.preventDefault();
                        if(parseInt(this.state.usdcApproved) > 0) {
                          
                          this.buyUsdc();
                        } else {
                          this.approveUsdc();
                        }
                      }}
                      >Buy with USDC</button> 
                <button  className='buy-button'     style={{height: '50px', width : '200px'}}
                      onClick={(e) => {
                        e.preventDefault();
                        if(parseInt(this.state.usdtApproved) > 0) {
                          this.buyUsdt();
                        } else {
                          this.approveUsdt();
                        }
                      }}
                      >Buy with USDT</button> 
                <button  className='buy-button'     style={{height: '50px', width : '200px'}}
                      onClick={(e) => {
                        e.preventDefault();
                        if(parseInt(this.state.wmaticApproved) > 0) {
                          this.buyWMatic();
                        } else {
                          this.approveWMatic();
                        }
                      }}
                      >Buy with wMatic</button>   
                <s.SpacerXSmall/>  
              </div>
            </main>

            <Container className='gaugeArea'>
                <Container className='gaugeInfo'>
                <p>
                  {this.state.leftInRound} Current Round Sales
                </p>

                <GaugeChart className='gauge' id="gauge-chart2" 
                  nrOfLevels={20} 
                      
                
                  percent={this.state.leftInRoundPercent}
                
                />

                </Container>
                
                <Container className='gaugeInfo'>
                <p>
                  {this.state.tokensSold} Blaq Tokens Sold so Far!
                </p>

                <GaugeChart className='gauge' id="gauge-chart2" 
                 nrOfLevels={20} 
                percent={this.state.tokensSold/5000} />

                </Container>

                <Container className='gaugeInfo'>
                <p>
                  Round {this.state.currentRound} 
                </p>

                <GaugeChart className='gauge' id="gauge-chart2" 
                 nrOfLevels={20} 
                percent={(this.state.currentRound-1)*0.25} />
                


                </Container>



                </Container>
          </div>
        </div>
        </center>
      </div>
      </div>
    );
  }
}

export default App;