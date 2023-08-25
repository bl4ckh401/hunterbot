import express from 'express';
import * as dotenv from 'dotenv';
import axios, {isCancel, AxiosError} from 'axios';
import { Pair, iToken } from './types/Interfaces';
import  mongoose from "mongoose";
import { Token } from './model/Token';
// import puppeteer from 'puppeteer';
// const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Use the provided port or default to 3000
const baseURL = 'https://api.dexscreener.com/latest/dex/tokens/';
const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const WETH_ADDRESS = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

const popularTokenAddresses = [
  "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // WETH
  // Add more addresses of popular tokens here
];

const connectDB = async () => {
  try {
      await mongoose.connect(process.env.MONGO_URL!, {
          connectTimeoutMS: 50000,
          socketTimeoutMS: 50000,

      });
      console.log(" Connection to the database established successfully");
  } catch (error) {
      console.log("Could not connect to the database  : ", error);
  }
};
// Function to get tokens with the most trading volume
async function getTokensWithMostVolume() {
    try {
        const response = await axios.get(`${baseURL + WETH_ADDRESS}`);
        const tokens = await response.data;

        // Sort tokens based on trading volume
        const sortedTokens = await tokens.pairs.sort((a: any, b: any) => b.volume.h24 - a.volume.h24);

        // Filter out tokens with popular addresses
        const filteredTokens = await sortedTokens.filter((token: any) => !popularTokenAddresses.includes(token.contractAddress));


        // Return the tokens with the most trading volume
        const tokensorting = await filteredTokens.slice(0, 10); // Return the first 10 tokens.

        let newTokens:any = []
        for(let i=0; i<tokensorting.length; i++){
          const {baseToken, pairAddress, quoteToken} = tokensorting[i];
          const tokenAddress = baseToken.address
          const tokenName = baseToken.name
          const pairedWith = quoteToken.address

          const token = await new Token({
            tokenAddress,
            pairAddress,
            tokenName, 
            pairedWith
          }).save()
          
          newTokens.push({
            tokenAddress,
            pairAddress,
            tokenName, 
            pairedWith
          })
          console.log(token)
        }

        

        return

    } catch (error) {
        console.error('Error fetching tokens:', error);
        return [];
    }
}

// async function getHotPairsFromDexTool() {
//   try {
//     const response:any = await axios.get('https://www.dextools.io/shared/hotpairs/hot?chain=ether');
//     console.log(response.data);
//   } catch (error) {
//       console.error('Error fetching hot pairs from DEXTool:', error);
//       return [];
//   }
// }

// Function to get trending pairs
async function getTrendingPairs() {
    try {
      const response = await axios.get(`${baseURL + WBNB_ADDRESS + "," + WETH_ADDRESS}`);
      const tokens = response.data;
  
      // Sort pairs based on price change (e.g., h1 change)
      const sortedTokens = tokens.pairs.sort((a:Pair, b:Pair) => b.priceChange.h1 - a.priceChange.h1);
  

      // Filter out tokens with popular addresses
      const filteredTokens = await sortedTokens.filter((token: any) => !popularTokenAddresses.includes(token.contractAddress));


      // Return the tokens with the most trading volume
      const tokensorting = await filteredTokens.slice(0, 10); // Return the first 10 tokens.

      let newTokens:any = []
      for(let i=0; i<
        tokensorting.length; i++){
        const {baseToken, pairAddress, quoteToken} = tokensorting[i];
        const tokenAddress = baseToken.address
        const tokenName = baseToken.name
        const pairedWith = quoteToken.address
        
        newTokens.push({
          tokenAddress,
          pairAddress,
          tokenName, 
          pairedWith
        })
        console.log(newTokens)
      }
    } catch (error) {
      console.error('Error fetching pairs:', error);
      return [];
    }
  }
  

// Define a route that responds with a message
app.get('/', (req:any, res:any) => {
  res.send('Listening to this port!');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Call the functions and log the results
async function main() {
    await connectDB()
    const tokensWithMostVolume = await getTokensWithMostVolume();

    // const hotPairs = await getHotPairsFromDexTool();
  
    // const trendingPairs = await getTrendingPairs();
  }
  
main();

const intervalTimeInMilliseconds = 2 * 60 * 1000; // 2 minutes in milliseconds

setInterval(main, intervalTimeInMilliseconds);
