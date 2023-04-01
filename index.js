import { ethers } from "./ethers-5.1.esm.min.js";
import { contractAddress, abi } from "./constants.js";

const connectButton = document.getElementById("connectButton");
connectButton.onclick = connect;

const getBalanceButton = document.getElementById("getBalanceButton");
getBalanceButton.onclick = getBalance;
const balanceH2 = document.getElementById("balance");

const fundButton = document.getElementById("fundButton");
fundButton.onclick = fund;

const withdrawButton = document.getElementById("withdrawButton");
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (e) {
      console.log(e);
    }
    connectButton.innerHTML = "Connected!";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    connectButton.innerHTML = "Install metamask!";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const balance = await provider.getBalance(contractAddress);
      balanceH2.innerHTML = ethers.utils.formatEther(balance);
    } catch (e) {
      console.log(e);
    }
  } else {
    getBalanceButton.innerHTML = "Install metamask!";
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmountInput").value;
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txnResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(txnResponse, provider);
      getBalance();
    } catch (error) {
      console.log(error);
    }

    // call fund and send value and store reponse.
    // use response to make a async call waiting for mined blocks
  } else {
    fundButton.innerHTML = "Install metamask!";
  }
}

async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const txnResponse = await contract.withdraw();
        await listenForTransactionMine(txnResponse, provider);
        getBalance();
      } catch (error) {
        console.log(error);
      }
  
      // call withdraw and send value and store reponse.
      // use response to make a async call waiting for mined blocks
    } else {
      withdrawButton.innerHTML = "Install metamask!";
    }
  }

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);

  return new Promise((resolve, reject) => {
    try {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations. `
            )
            resolve();

        })
    } catch (error) {
      reject(error);
    }
  });
}
