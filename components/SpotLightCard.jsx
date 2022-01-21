const SpotLightCard = () => {
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
                                    <button className="text-[#69EACB] px-4 py-2 font-bold w-[40%] bg-[#69EACB] bg-opacity-20">
                                        tip &rarr;
                                    </button>
                                    <div className="flex flex-col items-end w-[50%]">
                                        <p className="text-[#69EACB]/60 font-medium">
                                            2.5 SOL
                                        </p>
                                        <p className="text-white/80 font-medium">
                                            asd12dasda...1gt
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
    );
}

export default SpotLightCard;