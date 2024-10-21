"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider & {
      request?: (...args: any[]) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (
        event: string,
        callback: (...args: any[]) => void
      ) => void;
    };
  }
}

export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount("");
        setSignature("");
        setStatus("");
      }
    };

    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        if (!window.ethereum.request) {
          throw new Error("Ethereum provider does not have a request method");
        }
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  };

  const signMessage = async () => {
    if (!account) {
      console.log("Please connect your wallet first");
      return;
    }

    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const message = "Hi, I,m reDao Elite NFT holder";
        const signedMessage = await signer.signMessage(message);
        setSignature(signedMessage);
      } catch (error) {
        console.error("Error signing message:", error);
      }
    } else {
      console.log("Ethereum provider not found");
    }
  };

  const copyToClipboard = () => {
    if (signature) {
      navigator.clipboard.writeText(signature);
      setStatus("Signature copied to clipboard!");

      setTimeout(() => {
        setStatus("");
      }, 500);
    }
  };

  const logout = () => {
    setAccount("");
    setSignature("");
    setStatus("");
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 bg-gray-500 bg-center bg-no-repeat bg-contain"
      style={{
        backgroundImage: "url('https://app.redao.org/images/logo-decor.png')",
        backgroundSize: "contain",
      }}
    >
      {" "}
      <div className="w-full max-w-5xl p-4 mx-auto text-center bg-gray-300 rounded-lg shadow-md sm:p-6 md:p-8">
        <h1 className="mb-4 text-2xl font-bold text-gray-800 sm:text-3xl sm:mb-6">
          Redao Elite Club
        </h1>

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full px-4 py-2 font-bold text-white transition duration-300 bg-blue-500 rounded-full sm:w-auto hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-4">
            <p className="mb-4 text-sm text-gray-700 break-words sm:text-base">
              Connected Account:
              <span className="block font-medium sm:inline sm:ml-2">
                {account}
              </span>
            </p>
            <div className="flex flex-col justify-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button
                onClick={signMessage}
                className="w-full px-4 py-2 font-bold text-white transition duration-300 bg-blue-500 rounded-full sm:w-auto hover:bg-blue-600"
              >
                Sign Message
              </button>
              <button
                onClick={logout}
                className="w-full px-4 py-2 font-bold text-white transition duration-300 bg-red-500 rounded-full sm:w-auto hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {signature && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 break-words sm:text-base">
              Signature:
              <span className="block font-medium sm:inline sm:ml-2">
                {signature}
              </span>
            </p>
            <button
              onClick={() => {
                const telegramUrl = `tg://resolve?domain=redao_premium_bot&text=${encodeURIComponent(
                  `/sign ${signature}`
                )}`;
                window.open(telegramUrl, "_blank");
              }}
              className="w-full px-4 py-2 mt-4 font-bold text-white transition duration-300 bg-gray-500 rounded-full sm:w-auto hover:bg-gray-600"
            >
              Copy & Send to Bot
            </button>
          </div>
        )}
        {status && (
          <p className="mt-4 text-lg font-bold text-green-600">{status}</p>
        )}
      </div>
    </div>
  );
}
