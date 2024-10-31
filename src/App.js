import React, { useState } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from "@metamask/detect-provider";
import { Container, Grid, Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import './App.css';  // Add this line if you don't already have CSS imports

// Contract details
const contractAddress = "0x3a946a748E035570b856fe5D5D0b843582603dFF";  // Replace with your actual contract address
const contractABI = [
  {
    "inputs": [],
    "name": "mintRandom",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // Add other ABI functions if necessary
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
      setErrorMessage(""); // Clear error message on successful connection
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
      setErrorMessage(""); // Clear previous error messages

      const tx = await contract.mintRandom({
        value: ethers.utils.parseEther("10"),  // 10 APE for minting
        gasLimit: 5500000,
        maxFeePerGas: ethers.utils.parseUnits("35", "gwei"),
        maxPriorityFeePerGas: ethers.utils.parseUnits("3", "gwei")
      });

      await tx.wait();
      alert("Minted successfully!");
    } catch (error) {
      setErrorMessage("Minting failed: " + error.message);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Container>
      <Box my={5} textAlign="center">
        <Typography variant="h2">It's rotten</Typography>
      </Box>

      {errorMessage && (
        <Box my={2}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}

      {/* GIF Section */}
      <Box display="flex" justifyContent="center" my={4}>
        <img src="/rotten.gif" alt="Rotten Banana GIF" className="center-gif" />
      </Box>

      {/* Buttons Section */}
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={3}>
          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              onClick={connectWallet}
              sx={{ backgroundColor: account ? "#28A745" : "#EBC334" }}
            >
              {account ? `Connected: ${account.substring(0, 6)}...` : "Connect Wallet"}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              onClick={mintNFT}
              disabled={isMinting || !account}
              sx={{ backgroundColor: "#EBC334" }}
            >
              {isMinting ? <CircularProgress size={24} /> : "Mint Rotten NFT (10 APE)"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
