import { Deposit, Withdrawal, Transfer, FlashMint, FlashBurn } from '../../generated/templates/NGBwrapper/NGBwrapper'
import { User, WrapperAsset, WrapperHolding } from '../../generated/schema'
import { getOrInitWrapperHolding } from '../helpers'
import { BigInt } from '@graphprotocol/graph-ts'
import { log } from "matchstick-as/assembly/log"

export function handleDeposit(event: Deposit): void {
  let id = (event.params.to).toHexString()
  let WrapperAddress = (event.address).toHexString()
  let wrapper = WrapperAsset.load(WrapperAddress)!
  let hash = id.concat("-").concat(WrapperAddress)
  let holding = getOrInitWrapperHolding(hash, id, WrapperAddress)
  wrapper.Supply = wrapper.Supply.plus(event.params.wrappedAmount)
  holding.WrappedAmount = holding.WrappedAmount.plus(event.params.wrappedAmount)
  holding.save()
  wrapper.save()
}

export function handleWithdrawal(event: Withdrawal): void {
  let id = (event.params.from).toHexString()
  let WrapperAddress = (event.address).toHexString()
  let wrapper = WrapperAsset.load(WrapperAddress)!
  let hash = id.concat("-").concat(WrapperAddress)
  let holding = getOrInitWrapperHolding(hash, id, WrapperAddress)
  holding.WrappedAmount = holding.WrappedAmount.minus(event.params.wrappedAmount)
  wrapper.Supply = wrapper.Supply.minus(event.params.wrappedAmount)
  holding.save()
  wrapper.save()
}

export function handleTransfer(event: Transfer): void {
  let WrapperAddress = (event.address).toHexString()
  let wrapper = WrapperAsset.load(WrapperAddress)!
  let toHash = (event.params._to).toHexString()
               .concat("-")
               .concat(WrapperAddress)
  let fromHash = (event.params._from).toHexString()
               .concat("-")
               .concat(WrapperAddress)
  let toHolding = getOrInitWrapperHolding(toHash, (event.params._to).toHexString(), WrapperAddress)
  let fromHolding = getOrInitWrapperHolding(fromHash, (event.params._from).toHexString(), WrapperAddress)
  toHolding.WrappedAmount = toHolding.WrappedAmount.plus(event.params._value)
  fromHolding.WrappedAmount = fromHolding.WrappedAmount.minus(event.params._value)
  fromHolding.save()
  toHolding.save()
  wrapper.save()
}

export function handleFlashMint(event: FlashMint): void {
  let WrapperAddress = (event.address).toHexString()
  let toID = (event.params.to).toHexString()
  let holdingID = toID.concat("-").concat(WrapperAddress)
  let holding = getOrInitWrapperHolding(holdingID, toID, WrapperAddress)
  holding.WrappedAmount = holding.WrappedAmount.plus(event.params.wrappedAmount)
  holding.save()
}

export function handleFlashBurn(event: FlashBurn): void {
  let WrapperAddress = (event.address).toHexString()
  let asset = WrapperAsset.load((event.address).toHexString())!
  let toID = (event.params.from).toHexString()
  let holdingID = toID.concat("-").concat(WrapperAddress)
  let holding = getOrInitWrapperHolding(holdingID, toID, WrapperAddress)
  holding.WrappedAmount = holding.WrappedAmount.minus(event.params.wrappedAmount)
  asset.Supply = asset.Supply.minus(event.params.feeAmount)
  asset.save()
  holding.save()
}