import { useEffect, useState } from "react";
import { MainContract } from "../../../wrappers/MainContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "ton-core";
import {useTonConnect} from "./useTonConnect.ts";

export function useMainContract() {
    const client = useTonClient();
    const { sender } = useTonConnect();
    const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

    const [contractData, setContractData] = useState<null | {
        counter_value: number;
        recent_sender: Address;
        owner_address: Address;
    }>();

    const [balance,  ] = useState<null | number>(0);

    const mainContract = useAsyncInitialize(async () => {
        if (!client) return;
        const contract = new MainContract(
            Address.parse("EQCS7PUYXVFI-4uvP1_vZsMVqLDmzwuimhEPtsyQKIcdeNPu") // replace with your address from tutorial 2 step 8
        );
        return client.open(contract) as OpenedContract<MainContract>;
    }, [client]);

    useEffect(() => {
        async function getValue() {
            if (!mainContract) return;
            setContractData(null);
            const val = await mainContract.getData();
            setContractData({
                counter_value: val.number,
                recent_sender: val.recent_sender,
                owner_address: val.owner_address,
            });

            await sleep(5000); // sleep 5 seconds and poll value again
            getValue();
        }
        getValue();
    }, [mainContract]);

    return {
        contract_address: mainContract?.address.toString(),
        contract_balance: balance,
        ...contractData,
        sendIncrement: () => {
            return mainContract?.sendIncrement(sender, toNano("0.05"), 3);
        },
    };
}
