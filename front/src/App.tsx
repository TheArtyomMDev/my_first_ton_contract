import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import {useTonConnect} from "./hooks/useTonConnect.ts";

function App() {
    const {
        contract_address,
        counter_value,
        contract_balance,
        sendIncrement
    } = useMainContract();

    const { connected } = useTonConnect()

    return (
        <div>
            <div>
                <TonConnectButton />
            </div>
            <div>
                <div className='Card'>
                    <b>Our contract Address</b>
                    <div className='Hint'>{contract_address?.slice(0, 30) + "..."}</div>
                    <b>Our contract Balance</b>
                    <div className='Hint'>{contract_balance}</div>
                </div>
                <div className='Card'>
                    <b>Counter Value</b>
                    <div>{counter_value ?? "Loading..."}</div>
                </div>

                {connected && (
                    <a
                        onClick={() => {
                            sendIncrement();
                        }}
                    >
                        Increment
                    </a>
                )}
            </div>
        </div>
    );
}

export default App;
