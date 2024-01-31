import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as apisdk from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as morphoblue from 'src/protocols/morphoblue/tokens';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import * as spark from 'src/protocols/spark/tokens';
// import { spark } from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Zap Supply', function () {
  const chainId = common.ChainId.gnosis;
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;
  let service: logics.compoundv3.Service | logics.morphoblue.Service;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(
      chainId,
      user.address,
      aaveV3.gnosisTokens.USDC,
      '1000',
      '0xba12222222228d8ba445958a75a0704d566bf2c8'
    );
    await claimToken(
      chainId,
      user.address,
      aaveV3.gnosisTokens.WETH,
      '10',
      '0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f'
    );
  });

  snapshotAndRevertEach();

  context.only('Test Zap Supply Base', function () {
    const testCases = [
      // {
      //   protocolId: 'aave-v2',
      //   marketId: 'mainnet',
      //   srcToken: aaveV3.gnosisTokens.USDC,
      //   srcAmount: '100',
      //   destToken: aaveV3.gnosisTokens.WBTC,
      //   destAToken: aaveV2.aaveV3.gnosisTokens.aWBTC,
      //   expects: {
      //     logicLength: 2,
      //   },
      // },
      // {
      //   protocolId: 'radiant-v2',
      //   marketId: 'mainnet',
      //   srcToken: aaveV3.gnosisTokens.USDC,
      //   srcAmount: '100',
      //   destToken: aaveV3.gnosisTokens.WBTC,
      //   destAToken: radiantV2.aaveV3.gnosisTokens.rWBTC,
      //   expects: {
      //     logicLength: 2,
      //   },
      // },
      // {
      //   protocolId: 'aave-v3',
      //   marketId: 'gnosis',
      //   srcToken: aaveV3.gnosisTokens.USDC,
      //   srcAmount: '100',
      //   destToken: aaveV3.gnosisTokens.USDC,
      //   destAToken: aaveV3.gnosisTokens.aGnoUSDC,
      //   expects: { logicLength: 1 },
      // },
      {
        protocolId: 'spark',
        marketId: 'gnosis',
        srcToken: spark.gnosisTokens.WETH,
        srcAmount: '1',
        destToken: spark.gnosisTokens.WETH,
        destAToken: spark.gnosisTokens.spWETH,
        expects: { logicLength: 1 },
      },
      // {
      //   protocolId: 'compound-v3',
      //   marketId: logics.compoundv3.MarketId.ETH,
      //   srcToken: aaveV3.gnosisTokens.USDC,
      //   srcAmount: '100',
      //   destToken: aaveV3.gnosisTokens.WETH,
      //   destAToken: compoundV3.aaveV3.gnosisTokens.cWETHv3,
      //   expects: {
      //     logicLength: 2,
      //   },
      // },
    ];

    testCases.forEach(({ protocolId, marketId, srcToken, srcAmount, destToken, destAToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const account = user.address;
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

        // 1. user obtains a quotation for zap supply
        const zapDepositInfo = await adapter.zapSupply({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
        });

        // 2. user needs to permit the Protocolink user agent to supply for the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics: zapDepositInfo.logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // 3. user obtains a zap supply transaction request
        expect(zapDepositInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics: zapDepositInfo.logics,
          permitData,
          permitSig,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's balance will increase.
        await expect(user.address).to.changeBalance(destAToken, zapDepositInfo.destAmount, slippage);
      });
    });
  });

  context('Test Zap Supply Collateral', function () {
    const testCases = [
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        srcToken: aaveV3.gnosisTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: {
          logicLength: 2,
        },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        srcToken: aaveV3.gnosisTokens.USDC,
        srcAmount: '100',
        destToken: morphoblue.mainnetTokens.wstETH,
        expects: {
          logicLength: 2,
        },
      },
    ];

    testCases.forEach(({ protocolId, marketId, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const account = user.address;
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

        // 1. user obtains a quotation for zap supply
        const zapDepositInfo = await adapter.zapSupply({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
        });

        // 2. user needs to permit the Protocolink user agent to supply for the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics: zapDepositInfo.logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // 3. user obtains a zap supply transaction request
        expect(zapDepositInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics: zapDepositInfo.logics,
          permitData,
          permitSig,
        });

        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's balance will increase.
        if (protocolId === 'compound-v3') {
          service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
        } else if (protocolId === 'morphoblue') {
          service = new logics.morphoblue.Service(chainId, hre.ethers.provider);
        }
        const collateralBalance = await service.getCollateralBalance(marketId, user.address, destToken);
        const supplyDestAmount = new common.TokenAmount(destToken, zapDepositInfo.destAmount);

        // 4-1. rate may change when the block of getting api data is different from the block of executing tx
        const [min, max] = utils.bpsBound(supplyDestAmount.amount);
        const maxDestAmount = supplyDestAmount.clone().set(max);
        const minDestAmount = supplyDestAmount.clone().set(min);

        expect(collateralBalance.lte(maxDestAmount)).to.be.true;
        expect(collateralBalance.gte(minDestAmount)).to.be.true;
      });
    });
  });
});
