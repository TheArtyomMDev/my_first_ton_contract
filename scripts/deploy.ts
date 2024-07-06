import { address, toNano } from "@ton/core";
import { MainContract } from "../wrappers/MainContract";
import { compile, NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
    const myContract = MainContract.createFromConfig(
        {
            ownerAddress: 0,
            address: address("0QDIHoTtFWW5Rz6zYTSDJ7juwRxWk_xjjsKRUtvxPir2Uo9x"),
            owner_address: address(
                "0QDIHoTtFWW5Rz6zYTSDJ7juwRxWk_xjjsKRUtvxPir2Uo9x"
            ),
        },
        await compile("MainContract")
    );

    const openedContract = provider.open(myContract);

    openedContract.sendDeploy(provider.sender(), toNano("0.05"));

    await provider.waitForDeploy(myContract.address);
}