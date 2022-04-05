import { Deposit, Withdrawal, ClaimPayout, BalanceUpdate, BondBalanceUpdate } from '../../generated/templates/FixCapitalPool/FixCapitalPool'
import { FCP, FCPholding, WrapperHolding, User } from '../../generated/schema'
import { getOrInitFCPholding, getOrInitWrapperHolding, BigZero } from '../helpers'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleDeposit(event: Deposit): void {
  let id = (event.params.to).toHexString()
  let FCPaddress = (event.address).toHexString()
  let pool = FCP.load(FCPaddress)!
  let hash = id.concat("-").concat(FCPaddress)
  let holding = getOrInitFCPholding(hash, id, FCPaddress)
  holding.YieldAmount = holding.YieldAmount.plus(event.params.wrappedAmountDeposited)
  pool.save()
  holding.save()
}

export function handleWithdrawal(event: Withdrawal): void {
  let id = (event.params.from).toHexString()
  let FCPaddress = (event.address).toHexString()
  let pool = FCP.load(FCPaddress)!
  let hash = (event.params.from).toHexString()
       .concat("-")
       .concat(FCPaddress)
  let holding = getOrInitFCPholding(hash, id, FCPaddress)
  holding.YieldAmount = holding.YieldAmount.minus(event.params.wrappedAmountWithdrawn)
  pool.save()
  holding.save()
}

export function handleBondBalanceUpdated(event: BondBalanceUpdate): void {
  let id = (event.params.owner).toHexString()
  let FCPaddress = (event.address).toHexString()
  let hash = id.concat("-").concat(FCPaddress)
  let holding = getOrInitFCPholding(hash, id, FCPaddress)
  holding.BondAmount = event.params.newBond
  holding.save()
}

export function handleBalanceUpdated(event: BalanceUpdate): void {
  let id = (event.params.owner).toHexString()
  let FCPaddress = (event.address).toHexString()
  let hash = id.concat("-").concat(FCPaddress)
  let holding = getOrInitFCPholding(hash, id, FCPaddress)
  holding.BondAmount = event.params.newBond
  holding.YieldAmount = event.params.newYield
  holding.save()
}

export function handlePayoutClaimed(event: ClaimPayout): void {
  let id = (event.params.owner).toHexString()
  let FCPaddress = (event.address).toHexString()
  let hash = id.concat("-").concat(FCPaddress)
  let holding = getOrInitFCPholding(hash, id, FCPaddress)
  holding.YieldAmount = BigZero
  holding.BondAmount = BigZero
  holding.save()
}
