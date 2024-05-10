/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers';
import type { FunctionFragment, Result } from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from './common';

export interface ExecutorInterface extends utils.Interface {
  functions: {
    'executeFromAgent(address[],bytes[],uint256[])': FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: 'executeFromAgent'): FunctionFragment;

  encodeFunctionData(functionFragment: 'executeFromAgent', values: [string[], BytesLike[], BigNumberish[]]): string;

  decodeFunctionResult(functionFragment: 'executeFromAgent', data: BytesLike): Result;

  events: {};
}

export interface Executor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ExecutorInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    executeFromAgent(
      tos_: string[],
      datas_: BytesLike[],
      values_: BigNumberish[],
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  executeFromAgent(
    tos_: string[],
    datas_: BytesLike[],
    values_: BigNumberish[],
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    executeFromAgent(
      tos_: string[],
      datas_: BytesLike[],
      values_: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    executeFromAgent(
      tos_: string[],
      datas_: BytesLike[],
      values_: BigNumberish[],
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    executeFromAgent(
      tos_: string[],
      datas_: BytesLike[],
      values_: BigNumberish[],
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}