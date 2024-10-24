import React, { useState } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from "@metamask/detect-provider";
import { Container, Grid, Box, Button, Typography, CircularProgress, Alert } from '@mui/material';

// Contract details
const contractAddress = "0xD718B783823F421da1D7ddF4Bf6f0d437e249D80";  // Replace with your actual contract address
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

      // Fetch the current gas prices dynamically
      const gasPrice = await provider.getFeeData();

      // Call the mintRandom function from your Solidity contract
      const tx = await contract.mintRandom({
        value: ethers.utils.parseEther("10"),  // 10 APE for minting
        gasLimit: 5500000,
        maxFeePerGas: gasPrice.maxFeePerGas || ethers.utils.parseUnits("50", "gwei"),
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas || ethers.utils.parseUnits("3", "gwei")
      });

      await tx.wait();
      alert("Minted successfully!");
    } catch (error) {
      setErrorMessage("Minting failed: " + error.message); // Fixed string formatting
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Container>
      <Box my={5}>
        <Typography variant="h2" align="center">Mint Your Rotten NFT</Typography>
      </Box>

      {errorMessage && (
        <Box my={2}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
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
        <Grid item xs={12} sm={6}>
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
