import arbitrumTokensJSON from './data/arbitrum.json';
import bnbTokensJSON from './data/bnb.json';
import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);

type BnbTokenSymbols = keyof typeof bnbTokensJSON;

export const bnbTokens = common.toTokenMap<BnbTokenSymbols>(bnbTokensJSON);

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;

export const arbitrumTokens = common.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON);
