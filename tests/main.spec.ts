import {beginCell, Cell, toNano} from "@ton/core";
import {Blockchain, SandboxContract, TreasuryContract} from "@ton/sandbox";
import {MainContract} from "../wrappers/MainContract";
import "@ton/test-utils";
import {compile} from "@ton/blueprint";
import assert from "node:assert";

describe("main.fc contract tests", () => {
    let blockchain: Blockchain;
    let myContract: SandboxContract<MainContract>;
    let initWallet: SandboxContract<TreasuryContract>;
    let ownerWallet: SandboxContract<TreasuryContract>;
    let codeCell: Cell;

    beforeAll(async () => {
        codeCell = await compile("MainContract");
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        initWallet = await blockchain.treasury("initWallet");
        ownerWallet = await blockchain.treasury("ownerWallet");

        myContract = blockchain.openContract(
            await MainContract.createFromConfig(
                {
                    owner_address: ownerWallet.address,
                },
                codeCell
            )
        );
    });

    it("test data adding from owner", async () => {
        const senderWallet = await blockchain.treasury("sender");

        await myContract.sendDeposit(
            ownerWallet.getSender(),
            toNano("5"),
            25n,
            6n,
            25n,
        );

        const dat: Cell = beginCell().storeAddress(ownerWallet.address).endCell();
        const intAdr = BigInt('0x' + dat.bits.substring(11, 256).toString());

        const userData = await myContract.getData(intAdr);
        console.assert(userData.coins_sent === toNano("5"));
        console.assert(userData.usd_to_borrow === 25n);
        console.assert(userData.min_price_liquidation === 6n);
        console.assert(userData.max_price_liquidation === 25n);
    });


    it("test data adding from several wallets", async () => {
        await myContract.sendDeposit(
            ownerWallet.getSender(),
            toNano("5"),
            25n,
            6n,
            25n,
        );

        var dat: Cell = beginCell().storeAddress(ownerWallet.address).endCell();
        var intAdr = BigInt('0x' + dat.bits.substring(11, 256).toString());

        var userData = await myContract.getData(intAdr);
        console.assert(userData.coins_sent === toNano("5"));
        console.assert(userData.usd_to_borrow === 25n);
        console.assert(userData.min_price_liquidation === 6n);
        console.assert(userData.max_price_liquidation === 25n);

        const senderWallet = await blockchain.treasury("sender");

        await myContract.sendDeposit(
            senderWallet.getSender(),
            toNano("155"),
            125n,
            8n,
            25n,
        );

        dat = beginCell().storeAddress(senderWallet.address).endCell();
        intAdr = BigInt('0x' + dat.bits.substring(11, 256).toString());

        userData = await myContract.getData(intAdr);
        console.assert(userData.coins_sent === toNano("155"));
        console.assert(userData.usd_to_borrow === 125n);
        console.assert(userData.min_price_liquidation === 8n);
        console.assert(userData.max_price_liquidation === 25n);
    });

    /*
    it("should return deposit funds as no command is sent", async () => {
        const senderWallet = await blockchain.treasury("sender");

        const depositMessageResult = await myContract.sendNoCodeDeposit(
            senderWallet.getSender(),
            toNano("5")
        );

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: myContract.address,
            to: senderWallet.address,
            success: true,
        });

        const balanceRequest = await myContract.getBalance();

        expect(balanceRequest.number).toBe(0);
    });

    it("successfully withdraws funds on behalf of owner", async () => {

        const senderWallet = await blockchain.treasury("sender");

        await myContract.sendDeposit(senderWallet.getSender(), toNano("5"));

        const withdrawalRequestResult = await myContract.sendWithdrawalRequest(
            ownerWallet.getSender(),
            toNano("0.05"),
            toNano("1")
        );

        expect(withdrawalRequestResult.transactions).toHaveTransaction({
            from: myContract.address,
            to: ownerWallet.address,
            success: true,
            value: toNano(1),
        });
    });

    it("fails to withdraw funds on behalf of non-owner", async () => {
        const senderWallet = await blockchain.treasury("sender");

        await myContract.sendDeposit(senderWallet.getSender(), toNano("5"));

        const withdrawalRequestResult = await myContract.sendWithdrawalRequest(
            senderWallet.getSender(),
            toNano("0.5"),
            toNano("1")
        );

        expect(withdrawalRequestResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: false,
            exitCode: 103,
        });
    });

    it("fails to withdraw funds because lack of balance", async () => {
        const withdrawalRequestResult = await myContract.sendWithdrawalRequest(
            ownerWallet.getSender(),
            toNano("0.5"),
            toNano("1")
        );

        expect(withdrawalRequestResult.transactions).toHaveTransaction({
            from: ownerWallet.address,
            to: myContract.address,
            success: false,
            exitCode: 104,
        });
    });

     */
});
