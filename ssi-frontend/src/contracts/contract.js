import Web3 from "web3";
import SSIABI from "./SSI.json";

const CONTRACT_ADDRESS = "0xEbD9e80434ec2963A08905d257E7B343ab69d7d4";

let web3;
let contract;

// ✅ Get Web3 instance
export const getWeb3 = async () => {
  if (web3) return web3;

  if (typeof window.ethereum === "undefined") {
    alert("Metamask not detected! Please install it.");
    return null;
  }

  web3 = new Web3(window.ethereum);
  return web3;
};

// ✅ Connect to MetaMask and return account
export const getAccount = async () => {
  try {
    const web3Instance = await getWeb3();
    if (!web3Instance) return null;

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts[0];
  } catch (err) {
    console.error("Error getting account:", err);
    return null;
  }
};

// ✅ Get Contract Instance
export const getContract = async () => {
  try {
    const web3Instance = await getWeb3();
    if (!web3Instance) return null;

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No account connected");
    }

    // ✅ Check Network (IMPORTANT)
    const networkId = await web3Instance.eth.net.getId();
    console.log("Connected Network ID:", networkId);

    // 👉 Optional: enforce network (example for Ganache = 5777)
    // if (networkId !== 5777) {
    //   alert("Please switch to correct network (Ganache / Sepolia)");
    //   return null;
    // }

    // ✅ Create contract instance
    contract = new web3Instance.eth.Contract(
      SSIABI.abi,
      CONTRACT_ADDRESS
    );

    return contract;
  } catch (err) {
    console.error("Error connecting to contract:", err);
    return null;
  }
};

// ✅ Safe transaction helper (VERY IMPORTANT)
export const sendTransaction = async (method, account) => {
  try {
    // 🔥 Estimate gas FIRST (prevents MetaMask "Review alert" issue)
    const gas = await method.estimateGas({ from: account });

    console.log("Estimated Gas:", gas);

    // ✅ Send transaction with gas
    const receipt = await method.send({
      from: account,
      gas: Math.floor(gas * 1.2), // add buffer
    });

    return receipt;
  } catch (err) {
    console.error("Transaction failed:", err);
    throw err;
  }
};