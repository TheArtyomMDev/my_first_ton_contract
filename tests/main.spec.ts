import {beginCell, Cell, toNano} from "@ton/core";
import {Blockchain, SandboxContract, TreasuryContract} from "@ton/sandbox";
import {MainContract} from "../wrappers/MainContract";
import "@ton/test-utils";
import {compile} from "@ton/blueprint";

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

    it("test data adding", async () => {
        const senderWallet = await blockchain.treasury("sender");

        const sentMessageResult = await myContract.sendDeposit(
            ownerWallet.getSender(),
            toNano("5")
        );

        const dat: Cell = beginCell().storeAddress(ownerWallet.address).endCell();
        const intAdr = BigInt('0x' + dat.bits.substring(11, 256).toString());

        const data = await myContract.getData(intAdr);
        console.log(data);
        // expect(sentMessageResult.transactions).toHaveTransaction({
        //     from: senderWallet.address,
        //     to: myContract.address,
        //     success: true,
        // });
        //
        // const data = await myContract.getData();
        //
        // expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());
        // expect(data.number).toEqual(1);
    });

    /*
    it("successfully deposits funds", async () => {
        const senderWallet = await blockchain.treasury("sender");

        const depositMessageResult = await myContract.sendDeposit(
            senderWallet.getSender(),
            toNano("5")
        );

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            value: toNano("5"),
            success: true,
        });

        const balanceRequest = await myContract.getBalance();

        expect(balanceRequest.number).toBeGreaterThan(toNano("4.99"));
    });

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
