import Head from "next/head";
// import SpotLightCard from "../../components/SpotLightCard";
import { useState, useEffect } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import idl from "../idl.json";
import kp from "../keypair.json";

const { SystemProgram, Keypair } = web3;

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl("devnet");

const opts = {
    preflightCommitment: "processed",
};

export default function Home() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [gifList, setGifList] = useState([]);

    const checkIfWalletIsConnected = async () => {
        try {
            const { solana } = window;

            if (solana) {
                if (solana.isPhantom) {
                    console.log("Phantom Wallet found!");

                    const response = await solana.connect({
                        onlyIfTrusted: true,
                    });
                    console.log(
                        "Connected with public key: ",
                        response.publicKey.toString()
                    );
                    setWalletAddress(response.publicKey.toString());
                }
            } else {
                alert("Solana object not found! Get a Phantom Wallet 👻");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const connectWallet = async () => {
        const { solana } = window;
        if (solana) {
            const response = await solana.connect();
            console.log(
                "Connected with public key: ",
                response.publicKey.toString()
            );
            setWalletAddress(response.publicKey.toString());
        }
    };

    const sendGif = async () => {
        if (inputValue.length === 0) {
            console.log("No gif link given!");
            return;
        }
        setInputValue("");
        console.log("Gif link: ", inputValue);
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);

            await program.rpc.addGif(inputValue, {
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                },
            });
            console.log("GIF successfully sent to program", inputValue);
            await getGifList();
        } catch (error) {
            console.log("Error sending GIF:", error);
        }
    };

    const onInputChange = (e) => {
        const { value } = e.target;
        setInputValue(value);
    };

    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment);
        const provider = new Provider(
            connection,
            window.solana,
            opts.preflightCommitment
        );
        return provider;
    };

    // const createGifAccount = async () => {
    //     try {
    //         const provider = getProvider();
    //         const program = new Program(idl, programID, provider);
    //         console.log("ping");
    //         await program.rpc.startStuffOff({
    //             accounts: {
    //                 baseAccount: baseAccount.publicKey,
    //                 user: provider.wallet.publicKey,
    //                 systemProgram: SystemProgram.programId,
    //             },
    //             signers: [baseAccount]
    //         });
    //         console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
    //         await getGifList();

    //     } catch (error) {
    //         console.log("Error creating BaseAccount account:", error);
    //     }
    // }

    const addTip = async (index) => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);

            await program.rpc.addTip(index, {
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                },
            });
            console.log("Tipped a GIF", inputValue);
            await getGifList();
        } catch (error) {
            console.log("Error sending GIF:", error);
        }
    };

    const executeTransaction = async (index) => {
        try {
            const provider = window.solana;
            const pubKey = await provider.publicKey;
            console.log("pubKey: ", pubKey);

            var connection = new web3.Connection(web3.clusterApiUrl("devnet"));

            var recieverWallet = new web3.PublicKey(
                "AYVXAxbKuMky2i5W9KbX5LDT9rzzs4wX5QA1ox1c4i4c"
            );

            var transaction = new web3.Transaction().add(
                web3.SystemProgram.transfer({
                    fromPubkey: provider.publicKey,
                    toPubkey: recieverWallet,
                    lamports: 1000000000 * 0.1,
                })
            );

            // Setting the variables for the transaction
            transaction.feePayer = await provider.publicKey;
            let blockhashObj = await connection.getRecentBlockhash();
            transaction.recentBlockhash = await blockhashObj.blockhash;

            // Transaction constructor initialized successfully
            if (transaction) {
                console.log("Txn created successfully");
            }

            // Request creator to sign the transaction (allow the transaction)
            let signed = await provider.signTransaction(transaction);
            // The signature is generated
            let signature = await connection.sendRawTransaction(
                signed.serialize()
            );
            // Confirm whether the transaction went through or not
            await connection.confirmTransaction(signature);

            //Signature or the txn hash
            console.log("Signature: ", signature);

            await addTip(index);
        } catch (error) {
            console.log("Error sending tip:", error);
        }
    };

    const shortenAddress = (str) => {
        return str.substring(0, 6) + "..." + str.substring(str.length - 4);
    };

    useEffect(() => {
        const onLoad = async () => {
            // createGifAccount();
            await checkIfWalletIsConnected();
        };

        window.addEventListener("load", onLoad);
        return () => window.removeEventListener("load", onLoad);
    }, []);

    const getGifList = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            const account = await program.account.baseAccount.fetch(
                baseAccount.publicKey
            );

            console.log("Got the account", account);
            setGifList(
                account.gifList.sort(function (a, b) {
                    return b.tipCount.toNumber() - a.tipCount.toNumber();
                })
            );
        } catch (error) {
            console.log("Error in getGifList: ", error);
            setGifList(null);
        }
    };

    useEffect(() => {
        if (walletAddress) {
            console.log("Fetching GIF list... ");

            getGifList();
        }
    }, [walletAddress]);

    const getNotConnectedWallet = () => {
        return (
            <div className="relative h-11 flex items-center w-40">
                <div className="py-2 w-40 absolute h-11 bg-[#69EACB] text-center text-[#69EACB] left-[4px] top-[4px]">
                    --
                </div>
                <button
                    onClick={connectWallet}
                    className="bg-black py-2 w-full text-white font-medium z-[1] h-11"
                >
                    Connect Wallet
                </button>
            </div>
        );
    };

    const getConnectedWallet = () => {
        return (
            <div className="relative h-11 flex items-center w-40">
                <div className="py-2 w-40 absolute h-11 bg-[#69EACB] text-center text-[#69EACB] left-[4px] top-[4px]">
                    --
                </div>
                <div className="bg-black py-2 w-full text-white font-medium z-[1] h-11 flex items-center px-3 justify-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#69EACB]"></div>
                    {shortenAddress(walletAddress)}
                </div>
            </div>
        );
    };

    const SpotLightCard = ({ gif }) => {
        return (
            <div className="w-full max-w-sm h-[80%] bg-red-50 relative">
                <div className="py-2 w-full absolute h-full bg-[#69EACB] text-center text-[#69EACB] left-[6px] z-[-1] top-[6px]"></div>
                <div className="w-full h-full bg-black flex flex-col px-4 py-4 z-[1] justify-between">
                    <img
                        className="w-36 ml-4 mt-2"
                        src="/spotlight.svg"
                        alt=""
                    />
                    <div className="w-full flex flex-col justify-evenly">
                        <div className="w-full bg-red-50 mt-4 max-h-[60%]">
                            <img
                                className="w-full h-full object-cover"
                                src="https://media3.giphy.com/media/26BGuSXQAAwcOj3sA/200w.webp"
                                alt=""
                            />
                        </div>
                        <div className="w-full h-20 flex items-center justify-between mb-4">
                            <button
                                onClick={() =>
                                    executeTransaction(gif.index.toNumber())
                                }
                                className="text-[#69EACB] px-4 py-2 font-bold w-[40%] bg-[#69EACB] bg-opacity-20"
                            >
                                tip &rarr;
                            </button>
                            <div className="flex flex-col items-end w-[50%]">
                                <p className="text-[#69EACB]/60 font-medium">
                                    {gif?.tipCount.toNumber() === 0
                                        ? "0"
                                        : gif?.tipCount.toNumber() /
                                          1000000000}{" "}
                                    SOL
                                </p>
                                <p className="text-white/80 font-medium">
                                    {shortenAddress(gif.userAddress.toString())}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const Card = ({ gif }) => {
        return (
            <div className="relative w-[250px] h-[300px] place-self-end">
                <div className="w-[250px] h-[300px] bg-[#69EACB]  flex flex-col justify-end">
                    <div className="w-full flex items-center justify-between px-3 pb-3">
                        <button
                            onClick={() =>
                                executeTransaction(gif.index.toNumber())
                            }
                            className="text-[#000000] px-4 py-2 font-bold text-sm w-[40%] bg-[#000000] bg-opacity-20 self-end"
                        >
                            tip &rarr;
                        </button>
                        <div className="flex flex-col items-end w-[50%]">
                            <p className="text-black/60 font-bold text-sm">
                                {gif?.tipCount.toNumber() === 0
                                    ? "0"
                                    : gif.tipCount.toNumber() / 1000000000}{" "}
                                SOL
                            </p>
                            <p className="text-black/80 font-bold text-xs">
                                {shortenAddress(gif.userAddress.toString())}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-[250px] h-[250px] bg-black z-[1] p-2 pointer-events-none absolute left-[-10px] top-[-10px]">
                    <img
                        className="w-full h-full object-scale-down"
                        src={gif.gifLink}
                        alt=""
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="w-screen h-screen md:hidden flex flex-col items-center justify-center relative">
                <img src="/logo.svg" alt="" />
                <p className="text-black/50 text-sm font-bold mt-10">
                    A platform to share gifs in web3
                </p>
                <p className="text-red-300 text-sm font-bold">
                    Not available for phones yet
                </p>
                <p className="font-medium mt-20">
                    inspired by{" "}
                    <a
                        href="https://buildspace.so/"
                        target="_blank"
                        className="font-bold decoration-[#69EACB] underline"
                        rel="noreferrer"
                    >
                        BuildSpace
                    </a>
                </p>

                <div className="flex flex-col items-left gap-1 justify-evenly absolute bottom-4 left-4">
                            <a
                                className="font-bold decoration-[#69EACB] underline underline-offset-1"
                                href="https://twitter.com/datbugdied"
                                target="_blank"
                                rel="noreferrer"
                            >
                                dev
                            </a>
                            <a
                                className="font-bold decoration-[#69EACB] underline underline-offset-1"
                                href="https://github.com/azaek/gif3"
                                target="_blank"
                                rel="noreferrer"
                            >
                                code
                            </a>
                        </div>
            </div>

            <div className="h-screen w-screen overflow-hidden hidden md:block">
                <Head>
                    <title>gif3</title>
                    <meta name="description" content="gif collection in web3" />
                    <link rel="icon" href="/logo_sm.png" />
                </Head>
                <nav className="w-full h-24 flex items-center justify-between px-20 sticky top-0">
                    <div className="flex items-center gap-6">
                        <img src="/logo.svg" alt="" />
                        <div className="w-[1px] h-10 bg-[#C4C4C4]" />
                        <div className="flex flex-col items-left gap-1 justify-evenly">
                            <a
                                className="font-bold decoration-[#69EACB] underline underline-offset-1"
                                href="https://twitter.com/datbugdied"
                                target="_blank"
                                rel="noreferrer"
                            >
                                dev
                            </a>
                            <a
                                className="font-bold decoration-[#69EACB] underline underline-offset-1"
                                href="https://github.com/azaek/gif3"
                                target="_blank"
                                rel="noreferrer"
                            >
                                code
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-72 h-11 bg-black flex items-center px-4 py-2 justify-between">
                            <input
                                className="bg-black flex-1 border-none text-white outline-none"
                                type="text"
                                placeholder="gif image link"
                                value={inputValue}
                                onChange={onInputChange}
                            />
                            <button
                                onClick={sendGif}
                                className="text-[#69EACB] px-2"
                            >
                                &rarr;
                            </button>
                        </div>
                        {!walletAddress && getNotConnectedWallet()}
                        {walletAddress && getConnectedWallet()}
                    </div>
                </nav>

                <main className="w-screen h-full overflow-y-scroll sm:overflow-hidden flex flex-col sm:grid sm:grid-cols-6 grid-flow-row gap-10 mx-auto px-20 pt-10">
                    <section className="h-full w-full flex flex-col items-center col-span-2">
                        <SpotLightCard gif={gifList[0]} />
                    </section>

                    <section className="h-[80vh] flex flex-col px-4 overflow-x-hidden overflow-y-scroll col-span-4">
                        <div className="flex items-end justify-between ml-4 sticky top-0 bg-white z-20 py-4 px-2 w-full">
                            <img
                                className="w-36 "
                                src="/collection.svg"
                                alt=""
                            />
                            <p className="font-medium">
                                inspired by{" "}
                                <a
                                    href="https://buildspace.so/"
                                    target="_blank"
                                    className="font-bold decoration-[#69EACB] underline"
                                    rel="noreferrer"
                                >
                                    BuildSpace
                                </a>
                            </p>
                        </div>

                        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-y-10 grid-flow-row py-10 items-end mx-auto">
                            {gifList && gifList.slice(1).map((gif, index) => (
                                <Card key={index} gif={gif} />
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
