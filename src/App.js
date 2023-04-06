import { useState, useEffect } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import {loadContract} from './utils/load-contract';

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider:'',
    web3:null,
    contract:null,
  })

  const [account, setAccounts] = useState(null);
  const [balance, setBalance] = useState(null);
  const [remaining, setRemaining] = useState();
  // const [network, setNetwork] = useState();
  const [reload, shouldReload] = useState(false);

  const reloadEffect = ()=>shouldReload(!reload)
  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      const contract = await loadContract("Funder", provider)
      if(provider){
        provider.request({method: "eth_requestAccounts"});
        setWeb3Api({
          web3:new Web3(provider),
          provider,
          contract
        })      
      }
      else{
        console.error('Please install metamsk');
      }
      // if(window.ethereum){
      //   provider = window.ethereum;
      //   try{
      //     await provider.enable();
      //   }
      //   catch{
      //     console.error('User is not allowed');
      //   }
      // }else if(window.web3){
      //   provider = window.web3.currentProvider;
      // }else if(!process.env.production){
      //   provider = new Web3.providers.HttpProvider("http://localhost:7545");
      // }
      // console.log(window.web3);
      // console.log(window.ethereum);
    };

    loadProvider();
  }, []);

  useEffect(() => {

    const getAccount = async()=> {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccounts(accounts[0]);
    }
    web3Api.web3 && getAccount()
    // console.log(web3Api.web3);
  
    const loadBalance = async()=> {
     const {contract, web3} =web3Api;
     const balance = await web3.eth.getBalance(contract.address) ;
     setBalance(web3.utils.fromWei(balance, "ether"))
    };
    web3Api.contract && loadBalance();

  },[web3Api,reload], [web3Api.web3]);

  useEffect(() => {
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545')

    const abalance = async()=>{
    // async function abalance(){
      // const network = await web3.eth.net.getNetworkTypes()
      const remaining = await web3.eth.getBalance(account)
      // setNetwork(network);
      setRemaining(remaining);
    }
    abalance();
  },[account])

  const TransferFunds = async()=>{
    const {web3, contract} = web3Api;
    await contract.transfer({
      from: account,
      value:web3.utils.toWei("2", "ether")
    });
    reloadEffect();
  };

  const withdrawFund = async() =>{
    const {web3,contract} = web3Api;
    const withdrawAmount = web3.utils.toWei("2","ether");
    await contract.withDraw(withdrawAmount,{
      from: account,
    });
    reloadEffect();
  };


  return (
    <>
      <div className="card text-center">
        <div className="card-header">Funding</div>
        <div className="card-body">
          <h5 className="card-title">Balance: {balance} ETH</h5>
          <p className="card-text">Account : {account ? account : "not connected"}</p>
          <p className="card-text">Account Balance: {remaining} ETH</p>
          <button
            type="button"
            className="btn btn-success"
            onClick={async () => {
              const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
              });
              console.log(accounts);
            }}
          >
            Connect to metamask
          </button>
          &nbsp;
          <button type="button" className="btn btn-success"
          onClick={TransferFunds} >
            Transfer
          </button>
          &nbsp;
          <button type="button" className="btn btn-primary "
          onClick={withdrawFund}>
            Withdraw
          </button>
        </div>
        <div className="card-footer text-muted">FundTrans.</div>
      </div>
    </>
  );
}

export default App;
