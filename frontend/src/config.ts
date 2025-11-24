import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Configuration
export const NETWORK = Network.TESTNET;
export const CONTRACT_ADDRESS = "0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e";

// Initialize Aptos Client
const aptosConfig = new AptosConfig({ network: NETWORK });
export const aptos = new Aptos(aptosConfig);
