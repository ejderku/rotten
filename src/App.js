import React, { useState } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

const contractAddress = "0x566fb55db7FE670C4eB9994eF9776aa7Cb2B802d";  // Replace with your contract address
const contractABI = [
  // Your contract ABI here
];

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Function to connect to MetaMask
  const connectWallet = async () => {
    const ethProvider = await detectEthereumProvider();
    if (ethProvider) {
      const accounts = await ethProvider.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setProvider(new ethers.providers.Web3Provider(ethProvider));
    } else {
      setErrorMessage("MetaMask not detected. Please install MetaMask.");
    }
  };

  // Function to mint a Rotten NFT
  const mintNFT = async () => {
    if (!provider || !account) {
      setErrorMessage("Please connect to MetaMask.");
      return;
    }

    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
      setIsMinting(true);
      const tx = await contract.mintRandom({
        value: ethers.utils.parseEther("10"),  // 10 APE for minting
        gasLimit: 5500000,
        maxFeePerGas: ethers.utils.parseUnits("35", "gwei"),
        maxPriorityFeePerGas: ethers.utils.parseUnits("3", "gwei")
      });
      await tx.wait();
      alert("Minted successfully!");
    } catch (error) {
      setErrorMessage("Minting failed. " + error.message);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mint Your Rotten NFT</h1>
        {account ? (
          <div>
            <p>Connected as: {account}</p>
            <button onClick={mintNFT} disabled={isMinting}>
              {isMinting ? "Minting..." : "Mint Rotten NFT (10 APE)"}
            </button>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect MetaMask</button>
        )}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </header>
    </div>
  );
}

export default App;
