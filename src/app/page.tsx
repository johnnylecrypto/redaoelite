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

        const message = account;
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
      className="min-h-screen flex items-center justify-center bg-gray-500 bg-contain bg-center bg-no-repeat p-4"
      style={{
        backgroundImage: "url('https://app.redao.org/images/logo-decor.png')",
        backgroundSize: "contain",
      }}
    >
      {" "}
      <div className="bg-gray-300 p-4 sm:p-6 md:p-8 rounded-lg shadow-md text-center w-full max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">
          Redao Elite Club
        </h1>

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-4">
            <p className="mb-4 text-gray-700 text-sm sm:text-base break-words">
              Connected Account:
              <span className="font-medium block sm:inline sm:ml-2">
                {account}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
              <button
                onClick={signMessage}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
              >
                Sign Message
              </button>
              <button
                onClick={logout}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {signature && (
          <div className="mt-4">
            <p className="text-gray-700 text-sm sm:text-base break-words">
              Signature:
              <span className="font-medium block sm:inline sm:ml-2">
                {signature}
              </span>
            </p>
            <button
              onClick={copyToClipboard}
              className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 mt-4"
            >
              Copy
            </button>
          </div>
        )}

        {status && (
          <p className="mt-4 text-green-600 font-bold text-lg">{status}</p>
        )}
      </div>
    </div>
  );
}
