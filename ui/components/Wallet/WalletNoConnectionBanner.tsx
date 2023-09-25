import { SECOND } from "@pelagus/pelagus-background/constants"
import {
    selectNetworkConnectError
} from "@pelagus/pelagus-background/redux-slices/ui"
import classNames from "classnames"
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { useTranslation } from "react-i18next"
import { useBackgroundSelector } from "../../hooks"

export default function WalletNoConnectionBanner(): ReactElement {
  const { t } = useTranslation()
  const networkConnectError = useBackgroundSelector(selectNetworkConnectError)
  const timeout = useRef<number | undefined>()

  const resetTimeout = useCallback(() => {
    clearTimeout(timeout.current)
    timeout.current = undefined
  }, [])

//   useEffect(() => {
//     resetTimeout()
//     if (isDefaultWallet) {
//       timeout.current = window.setTimeout(() => setIsHidden(true), 5 * SECOND)
//     }
//   }, [isDefaultWallet, resetTimeout])

  return (
    <div
      className={classNames("default_toggle_container", {
        hidden: !networkConnectError,
      })}
    >
      <div className="no_connection">
        <div>
         {String(networkConnectError)} {/* Error connecting to network */}
        </div>
        <div className="spinner"></div>
      </div>
      <style jsx>{`
        .no_connection {
          display: flex;
          align-items: center;
          justify-content: space-between; // to space out text and spinner
          box-sizing: border-box;
          width: 100%;
          background-color: var(--error);
          font-weight: 500;
          font-size: 16px;
          line-height: 24px;
          padding: 8px;
          color: var(--hunter-green);
          border-radius: 8px;
        }
        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 3px solid var(--hunter-green);
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
          margin-right: 1px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .default_toggle_container {
          height: 40px;
          margin-bottom: 8px;
          width: calc(100% - 16px);
        }
        .default_toggle_container.hidden {
          opacity: 0;
          height: 0;
          margin-bottom: 0;
          pointer-events: none;
          transition: all 500ms;
        }
        .highlight {
          color: var(--trophy-gold);
        }
      `}</style>
    </div>
  )
}
