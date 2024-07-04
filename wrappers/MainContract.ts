import {Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode} from "@ton/core";


export type MainContractConfig = {
    number: number;
    address: Address;
};

export function mainContractConfigToCell(config: MainContractConfig): Cell {
    return beginCell().storeUint(config.number, 32).storeAddress(config.address).endCell();
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

    async getData(provider: ContractProvider) {
        const { stack } = await provider.get("get_contract_storage_data", []);
        return {
            number: stack.readNumber(),
            recent_sender: stack.readAddress(),
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
            .storeUint(increment_by, 32) // increment_by value
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }
}