import { createSlice } from "@reduxjs/toolkit"
import type { RootState } from "."
import { QUAI_NETWORK } from "../constants"
import { EIP1559Block, AnyEVMBlock, EVMNetwork } from "../networks"
import { removeChainBalances } from "./accounts"
import { selectCurrentNetwork } from "./selectors/uiSelectors"
import { setSelectedNetwork } from "./ui"
import { createBackgroundAsyncThunk } from "./utils"

type NetworkState = {
  blockHeight: number | null
  baseFeePerGas: bigint | null
  networkError: boolean
}

export type NetworksState = {
  evmNetworks: {
    [chainID: string]: EVMNetwork
  }
  blockInfo: {
    [chainID: string]: NetworkState
  }
}

export const initialState: NetworksState = {
  evmNetworks: {},
  blockInfo: {
    "1": {
      blockHeight: null,
      baseFeePerGas: null,
      networkError: false,
    },
  },
}

const networksSlice = createSlice({
  name: "networks",
  initialState,
  reducers: {
    blockSeen: (
      immerState,
      { payload: blockPayload }: { payload: AnyEVMBlock }
    ) => {
      const block = blockPayload as EIP1559Block
    
      if (!(block.network.chainID in immerState.blockInfo)) {
        immerState.blockInfo[block.network.chainID] = {
          blockHeight: block.blockHeight,
          baseFeePerGas: block?.baseFeePerGas ?? null,
          networkError: true,
        }
      } else if (
        block.blockHeight >
        (immerState.blockInfo[block.network.chainID].blockHeight || 0)
      ) {
        immerState.blockInfo[block.network.chainID].blockHeight =
          block.blockHeight
        immerState.blockInfo[block.network.chainID].baseFeePerGas =
          block?.baseFeePerGas ?? null
        immerState.blockInfo[block.network.chainID].networkError = true
      }
    },
    
    /**
     * Receives all supported networks as the payload
     */
    setEVMNetworks: (immerState, { payload }: { payload: EVMNetwork[] }) => {
      const chainIds = payload.map((network) => network.chainID)

      payload.forEach((network) => {
        immerState.evmNetworks[network.chainID] = network
      })

      // Remove payload missing networks from state
      Object.keys(immerState.evmNetworks).forEach((chainID) => {
        if (!chainIds.includes(chainID)) {
          delete immerState.evmNetworks[chainID]
          delete immerState.blockInfo[chainID]
        }
      })
    },

    setNetworkError: (
      immerState,
      { payload }: { payload: boolean }
    ) => {
      Object.keys(immerState.blockInfo).forEach((chainID) => {
        immerState.blockInfo[chainID].networkError = payload
      })
    },
  },
})

export const { blockSeen, setEVMNetworks, setNetworkError } = networksSlice.actions

export default networksSlice.reducer

export const removeCustomChain = createBackgroundAsyncThunk(
  "networks/removeCustomChain",
  async (chainID: string, { getState, dispatch, extra: { main } }) => {
    const store = getState() as RootState
    const currentNetwork = selectCurrentNetwork(store)

    if (currentNetwork.chainID === chainID) {
      await dispatch(setSelectedNetwork(QUAI_NETWORK))
    }
    await dispatch(removeChainBalances(chainID))

    return main.removeEVMNetwork(chainID)
  }
)
