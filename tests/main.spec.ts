import {address, Cell, toNano} from "@ton/core";
import {hex} from "../build/main.compiled.json";
import {Blockchain} from "@ton/sandbox";
import {MainContract} from "../wrappers/MainContract";
import "@ton/test-utils";

describe("main.fc contract tests", () => {
    it("test get latest sender", async () => {
        const blockchain = await Blockchain.create();
        const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];

        const initWallet = await blockchain.treasury("initWallet");
        const myContract = blockchain.openContract(
            await MainContract.createFromConfig({
                number: 0,
                address: initWallet.address,
            }, codeCell)
        );

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
