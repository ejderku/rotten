// Full App.js with updated mintNFT function
import React, { useState } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from "@metamask/detect-provider";
import { Container, Grid, Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import './App.css';

// Contract details
const contractAddress = "0x3a946a748E035570b856fe5D5D0b843582603dFF";  // Update with your actual contract address
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_receiver",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_quantity",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_currency",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_pricePerToken",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "bytes32[]",
            "name": "proof",
            "type": "bytes32[]"
          },
          {
            "internalType": "uint256",
            "name": "quantityLimitPerWallet",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pricePerToken",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "currency",
            "type": "address"
          }
        ],
        "internalType": "struct IDrop.AllowlistProof",
        "name": "_allowlistProof",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "claim",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
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

      // Minting transaction with specified value of 10 APE
      const tx = await contract.claim(
        account,  // Receiver's address
        1,  // Quantity to mint
        "0x0000000000000000000000000000000000000000", // Native currency (e.g., ETH or APE)
        ethers.utils.parseEther("10"), // Price per token in APE (10 APE)
        { proof: [], quantityLimitPerWallet: 1, pricePerToken: ethers.utils.parseEther("10"), currency: "0x0000000000000000000000000000000000000000" },  // Allowlist proof, if any
        "0x",  // Additional data
        {
          value: ethers.utils.parseEther("10"), // Specify the value directly here as 10 APE
          gasLimit: ethers.utils.hexlify(300000), // Adjust gas limit if needed
          maxPriorityFeePerGas: ethers.utils.parseUnits("3", "gwei"),
          maxFeePerGas: ethers.utils.parseUnits("35", "gwei")
        }
      );

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

      <Box display="flex" justifyContent="center" my={4}>
        <img src="/rotten.gif" alt="Rotten Banana GIF" className="center-gif" />
      </Box>

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
