import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Configuration
export const NETWORK = Network.TESTNET;
export const CONTRACT_ADDRESS = "0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e";

// Lazy initialization of Aptos Client to avoid module loading issues
let _aptos: Aptos | null = null;

export function getAptos(): Aptos {
  if (!_aptos) {
    const aptosConfig = new AptosConfig({ network: NETWORK });
    _aptos = new Aptos(aptosConfig);
  }
  return _aptos;
}

// For backward compatibility - use getter
export const aptos = {
  view: async (args: Parameters<Aptos['view']>[0]) => {
    return getAptos().view(args);
  },
  waitForTransaction: async (args: Parameters<Aptos['waitForTransaction']>[0]) => {
    return getAptos().waitForTransaction(args);
  }
};
