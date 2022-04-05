import { Deposit, Withdrawal, Transfer, FlashMint, FlashBurn } from "../generated/templates/NGBwrapper/NGBwrapper"
import { Deposit as D, Withdrawal as W, MakeLimitSellZCB, MakeLimitSellYT,
ModifyOrder } from "../generated/templates/OrderbookExchange/OrderbookExchange"
import { Deposit as Dep, Withdrawal as With, BondBalanceUpdate,
 BalanceUpdate, ClaimPayout } from "../generated/templates/FixCapitalPool/FixCapitalPool"
import { WrapperDeployment, FixCapitalPoolDeployment, OrderbookDeployment } from "../generated/Organizer/Organizer"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as/assembly/index"
import { log } from "matchstick-as/assembly/log"

export function newFCPDeposit(address: string, contractAddress: string, amount: i32): Dep {
    let mockEvent = changetype<Dep>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(address)))
    let amountParam = new ethereum.EventParam("wrappedAmountDeposited", ethereum.Value.fromI32(amount))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)

    return mockEvent
}

export function newZCBSell(address: string, contractAddress: string, prev: i32, newID: i32, amount: i32, MCR: i32): MakeLimitSellZCB {
    let mockEvent = changetype<MakeLimitSellZCB>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("maker", ethereum.Value.fromAddress(Address.fromString(address)))
    let amountParam = new ethereum.EventParam("prevID", ethereum.Value.fromI32(prev))
    let amountParam2 = new ethereum.EventParam("newID", ethereum.Value.fromI32(newID))
    let amountParam3 = new ethereum.EventParam("Amount", ethereum.Value.fromI32(amount))
    let amountParam4 = new ethereum.EventParam("MaturityConversionRate", ethereum.Value.fromI32(MCR))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)
    mockEvent.parameters.push(amountParam2)
    mockEvent.parameters.push(amountParam3)
    mockEvent.parameters.push(amountParam4)

    return mockEvent
}

export function newModifyOrder(contractAddress: string, ID: i32, change: i32): ModifyOrder {
    let mockEvent = changetype<ModifyOrder>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let amountParam = new ethereum.EventParam("orderID", ethereum.Value.fromI32(ID))
    let amountParam2 = new ethereum.EventParam("change", ethereum.Value.fromI32(change))
    mockEvent.parameters.push(amountParam)
    mockEvent.parameters.push(amountParam2)

    return mockEvent
}

export function newYTSell(address: string, contractAddress: string, prev: i32, newID: i32, amount: i32, MCR: i32): MakeLimitSellYT {
    let mockEvent = changetype<MakeLimitSellYT>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("maker", ethereum.Value.fromAddress(Address.fromString(address)))
    let amountParam = new ethereum.EventParam("prevID", ethereum.Value.fromI32(prev))
    let amountParam2 = new ethereum.EventParam("newID", ethereum.Value.fromI32(newID))
    let amountParam3 = new ethereum.EventParam("Amount", ethereum.Value.fromI32(amount))
    let amountParam4 = new ethereum.EventParam("MaturityConversionRate", ethereum.Value.fromI32(MCR))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)
    mockEvent.parameters.push(amountParam2)
    mockEvent.parameters.push(amountParam3)
    mockEvent.parameters.push(amountParam4)

    return mockEvent
}

export function newBookDeposit(address: string, contractAddress: string, amount: i32, yieldAmount: i32): D {
    let mockEvent = changetype<D>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(address)))
    let amountParam = new ethereum.EventParam("yieldDeposit", ethereum.Value.fromI32(yieldAmount))
    let amountParam2 = new ethereum.EventParam("bondDeposit", ethereum.Value.fromI32(amount))


    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)
    mockEvent.parameters.push(amountParam2)

    return mockEvent
}

export function newBookWithdrawal(address: string, contractAddress: string, amount: i32, yieldAmount: i32): W {
    let mockEvent = changetype<W>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(address)))
    let amountParam = new ethereum.EventParam("yieldWithdrawn", ethereum.Value.fromI32(yieldAmount))
    let amountParam2 = new ethereum.EventParam("bondWithdrawn", ethereum.Value.fromI32(amount))


    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)
    mockEvent.parameters.push(amountParam2)

    return mockEvent
}

export function newBondBalanceUpdate(address: string, contractAddress: string, amount: i32): BondBalanceUpdate {
    let mockEvent = changetype<BondBalanceUpdate>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("owner", ethereum.Value.fromAddress(Address.fromString(address)))
    let amountParam = new ethereum.EventParam("newBond", ethereum.Value.fromI32(amount))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)

    return mockEvent
}

export function newClaimPayout(address: string, contractAddress: string): ClaimPayout {
    let mockEvent = changetype<ClaimPayout>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("owner", ethereum.Value.fromAddress(Address.fromString(address)))

    mockEvent.parameters.push(addressParam)

    return mockEvent
}

export function newBalanceUpdate(address: string, contractAddress: string, amount: i32, newYield: i32): BalanceUpdate {
    let mockEvent = changetype<BalanceUpdate>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("owner", ethereum.Value.fromAddress(Address.fromString(address)))
    let amountParam = new ethereum.EventParam("newBond", ethereum.Value.fromI32(amount))
    let amountParam2 = new ethereum.EventParam("newYield", ethereum.Value.fromI32(newYield))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)
    mockEvent.parameters.push(amountParam2)

    return mockEvent
}

export function newFCPWithdrawal(address: string, contractAddress: string, amount: i32): With {
    let mockEvent = changetype<With>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.fromString(address)))
    let amountParam = new ethereum.EventParam("wrappedAmountWithdrawn", ethereum.Value.fromI32(amount))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)

    return mockEvent
}

export function newDeposit(address: string, contractAddress: string, amount: i32): Deposit {
	let mockEvent = changetype<Deposit>(newMockEvent())
	mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(address)))
    let amountParam = new ethereum.EventParam("wrappedAmount", ethereum.Value.fromI32(amount))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)

    return mockEvent
}

export function newFlashBurn(to: string,  contractAddress: string, amount: i32, fee: i32): FlashBurn {
    let mockEvent = changetype<FlashBurn>(newMockEvent())
    mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(to)))
    let amountParam = new ethereum.EventParam("wrappedAmount", ethereum.Value.fromI32(amount))
    let amountParam2 = new ethereum.EventParam("feeAmount", ethereum.Value.fromI32(fee))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)
    mockEvent.parameters.push(amountParam2)

    return mockEvent
}

export function newWithdrawal(address: string, contractAddress: string, amount: i32): Withdrawal {
	let mockEvent = changetype<Withdrawal>(newMockEvent())
	mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.fromString(address)))
    let amountParam = new ethereum.EventParam("wrappedAmount", ethereum.Value.fromI32(amount))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)

    return mockEvent
}

export function newTransfer(from: string, to: string,  contractAddress: string, amount: i32): Transfer {
	let mockEvent = changetype<Transfer>(newMockEvent())
	mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("_from", ethereum.Value.fromAddress(Address.fromString(from)))
    let addressParam2 = new ethereum.EventParam("_to", ethereum.Value.fromAddress(Address.fromString(to)))
    let amountParam = new ethereum.EventParam("wrappedAmount", ethereum.Value.fromI32(amount))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(addressParam2)
    mockEvent.parameters.push(amountParam)

    return mockEvent
}

export function newFlashMint(to: string,  contractAddress: string, amount: i32): FlashMint {
	let mockEvent = changetype<FlashMint>(newMockEvent())
	mockEvent.address = Address.fromString(contractAddress)
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(to)))
    let amountParam = new ethereum.EventParam("wrappedAmount", ethereum.Value.fromI32(amount))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(amountParam)

    return mockEvent
}

export function newWrapper(wrapperaddress: string, underlying: string, owner: string, type: i32):  WrapperDeployment {
	let mockEvent = changetype<WrapperDeployment>(newMockEvent())
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("wrapperAddress", ethereum.Value.fromAddress(Address.fromString(wrapperaddress)))
    let addressParam2 = new ethereum.EventParam("underlyingAddress", ethereum.Value.fromAddress(Address.fromString(underlying)))
    let addressParam3 = new ethereum.EventParam("owner", ethereum.Value.fromAddress(Address.fromString(owner)))
    let amountParam = new ethereum.EventParam("wrapperType", ethereum.Value.fromI32(type))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(addressParam2)
    mockEvent.parameters.push(addressParam3)
    mockEvent.parameters.push(amountParam)

    return mockEvent
}

export function newFCP(fcp: string, underlying: string, owner: string, maturity: i32):  FixCapitalPoolDeployment {
	let mockEvent = changetype<FixCapitalPoolDeployment>(newMockEvent())
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("FCPaddress", ethereum.Value.fromAddress(Address.fromString(fcp)))
    let addressParam2 = new ethereum.EventParam("BaseWrapperAddress", ethereum.Value.fromAddress(Address.fromString(underlying)))
    let addressParam3 = new ethereum.EventParam("owner", ethereum.Value.fromAddress(Address.fromString(owner)))
    let amountParam = new ethereum.EventParam("maturity", ethereum.Value.fromI32(maturity))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(addressParam2)
    mockEvent.parameters.push(addressParam3)
    mockEvent.parameters.push(amountParam)

    return mockEvent
}

export function newOrderBook(book: string, fcp: string):  OrderbookDeployment {
	let mockEvent = changetype<OrderbookDeployment>(newMockEvent())
    mockEvent.parameters = new Array()
    let addressParam = new ethereum.EventParam("OrderbookAddress", ethereum.Value.fromAddress(Address.fromString(book)))
    let addressParam2 = new ethereum.EventParam("BaseFCPAddress", ethereum.Value.fromAddress(Address.fromString(fcp)))

    mockEvent.parameters.push(addressParam)
    mockEvent.parameters.push(addressParam2)

    return mockEvent
}