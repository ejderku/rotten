import React, { useState } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { Container, Grid, Box, Button, Typography, CircularProgress, Alert } from "@mui/material"; // Import Material UI components

const contractAddress = "0x566fb55db7FE670C4eB9994eF9776aa7Cb2B802d"; // Replace with your contract address
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
        value: ethers.utils.parseEther("10"), // 10 APE for minting
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
    <Container maxWidth="md">
      <Box my={5}>
        <Typography variant="h2" align="center" gutterBottom>
          Mint Your Rotten NFT
        </Typography>
      </Box>

      {errorMessage && (
        <Box my={2}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} textAlign="center">
          {account ? (
            <>
              <Typography variant="h6" gutterBottom>
                Connected as: {account}
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={mintNFT}
                disabled={isMinting}
                sx={{ backgroundColor: "#EBC334" }} // Yellow theme for minting button
              >
                {isMinting ? (
                  <>
                    <CircularProgress size={24} /> Minting...
                  </>
                ) : (
                  "Mint Rotten NFT (10 APE)"
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={connectWallet}
              sx={{ backgroundColor: "#28A745" }} // Green theme for connect button
            >
              Connect MetaMask
            </Button>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
