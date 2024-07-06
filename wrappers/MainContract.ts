import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    TupleItem, TupleItemInt
} from "@ton/core";

export type MainContractConfig = {
    owner_address: Address;
    // address: Address;
    // owner_address: Address;
};

export function mainContractConfigToCell(config: MainContractConfig): Cell {
    return beginCell()
        // .storeInt(config.owner_address.hash.readBigInt64BE(), 64)
        // .storeRef(beginCell().storeUint(0, 32).endCell())
        // .storeMaybeRef(null)
        // .storeMaybeRef(null)
        .endCell();
}

export class MainContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromConfig(
        config: MainContractConfig,
        code: Cell,
        workchain = 0
    ) {
        const data = mainContractConfigToCell(config);
        const init = { code, data };
        const address = contractAddress(workchain, init);

        return new MainContract(address, init);
    }

    async sendInternalMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getData(provider: ContractProvider, address: bigint) {
        console.log(address);

        const addressInt: TupleItemInt = {type: "int", value: address};
        const args: TupleItemInt[] = [addressInt];
        const { stack } = await provider.get("get_value", args);

        return stack.readCell().beginParse();
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    // async getData(provider: ContractProvider) {
    //     const { stack } = await provider.get("get_contract_storage_data", []);
    //     return {
    //         number: stack.readNumber(),
    //         recent_sender: stack.readAddress(),
    //         owner_address: stack.readAddress(),
    //     };
    // }

    async getBalance(provider: ContractProvider) {
        const { stack } = await provider.get("balance", []);
        return {
            number: stack.readNumber(),
        };
    }

    async sendIncrement(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        increment_by: number
    ) {

        const msg_body = beginCell()
            .storeUint(1, 32) // OP code
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }

    async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
        const msg_body = beginCell()
            .storeUint(1, 32) // OP code
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }

    async sendNoCodeDeposit(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        const msg_body = beginCell().endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }

    async sendWithdrawalRequest(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        amount: bigint
    ) {
        const msg_body = beginCell()
            .storeUint(3, 32) // OP code
            .storeCoins(amount)
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }
}