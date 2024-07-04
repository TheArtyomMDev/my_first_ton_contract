import {address, Cell, toNano} from "@ton/core";
import {hex} from "../build/main.compiled.json";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import {MainContract} from "../wrappers/MainContract";
import "@ton/test-utils";

describe("main.fc contract tests", () => {
    let blockchain: Blockchain;
    let myContract: SandboxContract<MainContract>;
    let initWallet: SandboxContract<TreasuryContract>;
    let ownerWallet: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        initWallet = await blockchain.treasury("initWallet");
        ownerWallet = await blockchain.treasury("ownerWallet");

        const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];

        myContract = blockchain.openContract(
            await MainContract.createFromConfig(
                {
                    number: 0,
                    address: initWallet.address,
                    owner_address: ownerWallet.address,
                },
                codeCell
            )
        );
    });

    it("test get latest sender", async () => {
        const senderWallet = await blockchain.treasury("sender");

        const sentMessageResult = await myContract.sendIncrement(
            senderWallet.getSender(),
            toNano("0.05"),
            1
        );

        expect(sentMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
        });

        const data = await myContract.getData();

        expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());
        expect(data.number).toEqual(1);
    });
});
