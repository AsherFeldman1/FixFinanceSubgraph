import { OpenVault, CloseVault, AdjustVault, AuctionLiquidation,
 BidOnLiquidation, ClaimLiquidation, InstantLiquidation, ClaimRebate,
 OpenYTVault, CloseYTVault, AdjustYTVault, AuctionYTLiquidation, BidOnYTLiquidation,
 ClaimYTLiquidation, InstantYTLiquidation, ClaimYTRebate, TransferVault } from '../../generated/templates/NSFVaultFactory/NSFVaultFactory'
import { Vault, User, VaultCollateral, VaultDebt, YTVault } from '../../generated/schema'
import { getUser, BigZero, handleChange3, getVault, getYTVault, handleYTChange3 } from '../helpers'
import { BigInt } from '@graphprotocol/graph-ts'


export function handleOpenVault(event: OpenVault): void {
  let id = (event.params.index).toHexString().concat("-")
	.concat("3")
  handleChange3(event.params.index, (event.params.owner).toHexString(), id, (event.address).toHexString())
}

export function handleCloseVault(event: CloseVault): void {
  let id = (event.params.index).toHexString().concat("-")
	.concat("3")
  let vault = getVault(id, (event.params.owner).toHexString(), 3)
  vault.Debt = ""
  vault.Collateral = ""
  vault.Owner = ""
  vault.save()
}

export function handleAdjustVault(event: AdjustVault): void {
  let id = (event.params.index).toHexString().concat("-").concat("3")
  handleChange3(event.params.index, (event.params.owner).toHexString(), id, (event.address).toHexString())
}

export function handleInstantLiquidation(event: InstantLiquidation): void {
  let id = (event.params.index).toHexString().concat("-")
  .concat("3")
  let vault = getVault(id, (event.params.owner).toHexString(), 3)
  vault.Debt = ""
  vault.Collateral = ""
  vault.Owner = ""
  vault.save()
}

export function handleOpenYTVault(event: OpenYTVault): void {
  let id = (event.params.index).toHexString().concat("-")
  .concat("3")
  handleYTChange3(event.params.index, (event.params.owner).toHexString(), id, (event.address).toHexString())
}

export function handleCloseYTVault(event: CloseYTVault): void {
  let id = (event.params.index).toHexString().concat("-")
  .concat("3")
  let vault = getYTVault(id, (event.params.owner).toHexString(), 3)
  vault.Debt = ""
  vault.Collateral = ""
  vault.Owner = ""
  vault.save()
}

export function handleAdjustYTVault(event: AdjustYTVault): void {
  let id = (event.params.index).toHexString().concat("-").concat("3")
  handleYTChange3(event.params.index, (event.params.owner).toHexString(), id, (event.address).toHexString())
}

export function handleInstantYTLiquidation(event: InstantYTLiquidation): void {
	let id = (event.params.index).toHexString().concat("-")
  .concat("3")
  let vault = getVault(id, (event.params.owner).toHexString(), 3)
  vault.Debt = ""
  vault.Collateral = ""
  vault.Owner = ""
  vault.save()
}

export function handleTransferVault(event: TransferVault): void {
  let id = (event.params.prevIndex).toHexString().concat("-")
  .concat("3")
  if (event.params.isYTVault) {
    let vault = getYTVault(id, (event.params.prevOwner).toHexString(), 3)
    vault.Owner = (event.params.newOwner).toHexString()
    vault.save()
  } else {
    let vault = getVault(id, (event.params.prevOwner).toHexString(), 3)
    vault.Owner = (event.params.newOwner).toHexString()
    vault.save()
  }
}