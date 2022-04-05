import { BigInt, Address } from '@graphprotocol/graph-ts'
import { User, WrapperHolding, WrapperAsset, FCPholding, FCP, OrderbookPosition, Orderbook, Vault,
VaultCollateral, VaultDebt, YTVault, YTVaultCollateral, YTVaultDebt } from '../generated/schema'
import { DBSFVaultFactory } from '../generated/templates/DBSFVaultFactory/DBSFVaultFactory'
import { NSFVaultFactory } from '../generated/templates/NSFVaultFactory/NSFVaultFactory'
import { IInfoOracle } from '../generated/Organizer/IInfoOracle'
export const DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000000"
export const Address1 = "0x0000000000000000000000000000000000000001"
export const BONE = BigInt.fromI32(10).pow(18)
export const BigZero = BigInt.fromI32(0)
export const BigOne = BigInt.fromI32(1)
export const IInfoOracleAddress = "0x0000000000000000000000000000000000000000"

export function getUser(address: string): User {
  let holder = User.load(address)
  if (!holder) {
  	holder = new User(address)
  	holder.WrapperHoldings = []
  	holder.FCPholdings = []
  	holder.WrappersCreated = []
  	holder.FCPsCreated = []
  	holder.OrderbooksCreated = []
    holder.Vaults = []
  	holder.save()
  }
  return holder as User
}

export function getOrInitFCPholding(id: string, user: string, pool: string): FCPholding {
  let holding = FCPholding.load(id)
  getUser(user)
  if (!holding) {
    holding = new FCPholding(id)
  	holding.OrderBookPosition = ""
  	holding.BondAmount = BigZero
  	holding.YieldAmount = BigZero
  	holding.Holder = user
  	holding.Pool = pool
  	holding.save()
  }
  return holding as FCPholding
}

export function getOrInitWrapperHolding(id: string, user: string, wrapper: string): WrapperHolding {
  let holding = WrapperHolding.load(id)
  getUser(user)
  if (!holding) {
    holding = new WrapperHolding(id)
	  holding.Asset = wrapper
    holding.Holder = user
    holding.WrappedAmount = BigZero
    holding.save()
  }
  return holding as WrapperHolding
}

export function getOrderbookPosition(id: string, user: string, orderbook: string): OrderbookPosition {
  let position = OrderbookPosition.load(id)
  if (!position) {
    position = new OrderbookPosition(id)
  	let OrderBook = Orderbook.load(orderbook)!
  	let Holding = getOrInitFCPholding(id, user, OrderBook.Pool)
  	Holding.OrderBookPosition = id
  	position.User = user
  	position.Orderbook = orderbook
  	position.LockedYT = BigZero
  	position.LockedZCB = BigZero
  	position.DepositedBondAmount = BigZero
  	position.DepositedYieldAmount = BigZero
  	position.ZCBsells = []
  	position.YTsells = []
  	position.save()
  	Holding.save()
  }
  return position as OrderbookPosition
}

export function getVault(id: string, owner: string, type: number): Vault {
  getUser(owner)
  let vault = Vault.load(id)
  if (!vault) {
    vault = new Vault(id)
    if (type == 1) {
      vault.Type = "DBSF"
    } else if (type == 2) {
      vault.Type = "NSF"
    } else {
      vault.Type = "SBNSF"
    }
    vault.Collateral = ""
    vault.Debt = ""
    vault.Owner = owner
    vault.save()
  }
  return vault as Vault
}

export function determineCollateralType(collateral: string, factoryAddress: string): i32 {
  let factory = Address.fromString(factoryAddress)
  let collateral1 = Address.fromString(collateral)
  let oracleAddress = Address.fromString(IInfoOracleAddress)
  let oracle = IInfoOracle.bind(oracleAddress)
  let whiteListAddr = oracle.collateralWhitelist(factory, collateral1)
  if (whiteListAddr == Address.fromString(DEFAULT_ADDRESS)) {
    return 1
  } else if (whiteListAddr == Address.fromString(Address1)) {
    return 2
  } else {
    return 3
  }
}

export function handleChange(index: BigInt, user: string, id: string, factoryAddress: string): void {
  getUser(user)
  let vault = getVault(id, user, 1)
  let factory = Address.fromString(factoryAddress)
  let vaultFactory = DBSFVaultFactory.bind(factory)
  let realAddress = Address.fromString(user)
  let res = vaultFactory.vaults(realAddress, index)
  let collateral = res.value0
  let debt = res.value1
  let collateralAmount = res.value2
  let debtAmount = res.value3
  let fee = res.value4
  let stabilityFee = res.value6
  let currentCollateral = VaultCollateral.load(vault.Collateral)!
  if (vault.Collateral != id.concat("-").concat(collateral.toHexString())) {
    let newCollateral = VaultCollateral.load(id.concat("-").concat(collateral.toHexString()))
    if (!newCollateral) {
      newCollateral = new VaultCollateral(id.concat("-").concat(collateral.toHexString()))
    }
    let type = determineCollateralType(collateral.toHexString(), factoryAddress)
    if (type == 1) {
      newCollateral.AssetType = "ZCB"
    } else if(type == 2) {
      newCollateral.AssetType = "ERC20"
    } else {
      newCollateral.AssetType = "Wrapper"
    }
    newCollateral.Asset = collateral.toHexString()
    newCollateral.Amount = collateralAmount
    vault.Collateral = id.concat("-").concat(collateral.toHexString())
    currentCollateral.Amount = BigZero
    newCollateral.save()
  } else if (collateralAmount != currentCollateral.Amount) {
    currentCollateral.Amount = collateralAmount
  }
  currentCollateral.save()
  let currentDebt = VaultDebt.load(vault.Debt)!
  if (vault.Debt != (id.concat("-").concat(debt.toHexString()))) {
    let newDebt = VaultDebt.load(id.concat("-").concat(debt.toHexString()))
    if (!newDebt) {
      newDebt = new VaultDebt(id.concat("-").concat(debt.toHexString()))
    }
    newDebt.Asset = debt.toHexString()
    newDebt.Amount = debtAmount
    vault.Debt = (id.concat("-").concat(debt.toHexString()))
    currentDebt.Amount = BigZero
    newDebt.save()
  } else if (debtAmount != currentDebt.Amount) {
    currentDebt.Amount = debtAmount
  }
  currentDebt.save()
  if (stabilityFee != vault.StabilityFeeAPR) {
    vault.StabilityFeeAPR = stabilityFee
  }
  if (fee != vault.AmountSFee) {
    vault.AmountSFee = fee
  }
  vault.save()
}

export function getYTVault(id: string, owner: string, type: number): YTVault {
  getUser(owner)
  let vault = YTVault.load(id)
  if (!vault) {
    vault = new YTVault(id)
    if (type == 1) {
      vault.Type = "DBSF"
    } else if (type == 2) {
      vault.Type = "NSF"
    } else {
      vault.Type = "SBNSF"
    }
    vault.Collateral = ""
    vault.Debt = ""
    vault.Owner = owner
    vault.save()
  }
  return vault as YTVault
}

export function handleYTChange(index: BigInt, user: string, id: string, factoryAddress: string): void {
  getUser(user)
  let vault = getYTVault(id, user, 1)
  let factory = Address.fromString(factoryAddress)
  let vaultFactory = DBSFVaultFactory.bind(factory)
  let realAddress = Address.fromString(user)
  let res = vaultFactory.YTvaults(realAddress, index)
  let collateral = res.value0
  let debt = res.value1
  let collateralAmountYield = res.value2
  let collateralAmountBond = res.value3
  let debtAmount = res.value4
  let amountSFee = res.value5
  let stabilityFee = res.value7
  let currentCollateral = YTVaultCollateral.load(vault.Collateral)!
  if (vault.Collateral != (id.concat("-").concat(collateral.toHexString()))) {
    let newCollateral = YTVaultCollateral.load(id.concat("-").concat(collateral.toHexString()))!
    if (!newCollateral) {
      newCollateral = new YTVaultCollateral(id.concat("-").concat(collateral.toHexString()))
    }
    newCollateral.Pool = collateral.toHexString()
    newCollateral.BondSupplied = collateralAmountBond
    newCollateral.YieldSupplied = collateralAmountYield
    vault.Collateral = (id.concat("-").concat(collateral.toHexString()))
    currentCollateral.BondSupplied = BigZero
    currentCollateral.YieldSupplied = BigZero
    newCollateral.save()
  } else if (collateralAmountYield != currentCollateral.YieldSupplied || collateralAmountBond != currentCollateral.BondSupplied) {
    currentCollateral.YieldSupplied = collateralAmountYield
    currentCollateral.BondSupplied = collateralAmountBond
  }
  currentCollateral.save()
  let currentDebt = YTVaultDebt.load(vault.Debt)!
  if (vault.Debt != (id.concat("-").concat(debt.toHexString()))) {
    let newDebt = YTVaultDebt.load(id.concat("-").concat(debt.toHexString()))
    if (!newDebt) {
      newDebt = new YTVaultDebt(id.concat("-").concat(debt.toHexString()))
    }
    newDebt.Pool = debt.toHexString()
    newDebt.ZCBBorrowed = debtAmount
    vault.Debt = (id.concat("-").concat(debt.toHexString()))
    currentDebt.ZCBBorrowed = BigZero
    newDebt.save()
  } else if (debtAmount != currentDebt.ZCBBorrowed) {
    currentDebt.ZCBBorrowed = debtAmount
  }
  currentDebt.save()
  if (stabilityFee != vault.StabilityFeeAPR) {
    vault.StabilityFeeAPR = stabilityFee
  }
  if (amountSFee != vault.AmountSFee) {
    vault.AmountSFee = amountSFee
  }
  vault.save()
}

export function handleChange2(index: BigInt, user: string, id: string, factoryAddress: string): void {
  getUser(user)
  let vault = getVault(id, user, 2)
  let factory = Address.fromString(factoryAddress)
  let vaultFactory = NSFVaultFactory.bind(factory)
  let realAddress = Address.fromString(user)
  let res = vaultFactory.vaults(realAddress, index)
  let collateral = res.value0
  let debt = res.value1
  let collateralAmount = res.value2
  let debtAmount = res.value3
  let currentCollateral = VaultCollateral.load(vault.Collateral)!
  if (vault.Collateral != (id.concat("-").concat(collateral.toHexString()))) {
    let newCollateral = VaultCollateral.load(id.concat("-").concat(collateral.toHexString()))!
    if (!newCollateral) {
      newCollateral = new VaultCollateral(id.concat("-").concat(collateral.toHexString()))
    }
    let type = determineCollateralType(collateral.toHexString(), factoryAddress)
    if (type == 1) {
      newCollateral.AssetType = "ZCB"
    } else if(type == 2) {
      newCollateral.AssetType = "ERC20"
    } else {
      newCollateral.AssetType = "Wrapper"
    }
    newCollateral.Asset = collateral.toHexString()
    newCollateral.Amount = collateralAmount
    vault.Collateral = (id.concat("-").concat(collateral.toHexString()))
    currentCollateral.Amount = BigZero
    newCollateral.save()
  } else if (collateralAmount != currentCollateral.Amount) {
    currentCollateral.Amount = collateralAmount
  }
  currentCollateral.save()
  let currentDebt = VaultDebt.load(vault.Debt)!
  if (vault.Debt != (id.concat("-").concat(debt.toHexString()))) {
    let newDebt = VaultDebt.load(id.concat("-").concat(debt.toHexString()))!
    if (!newDebt) {
      newDebt = new VaultDebt(id.concat("-").concat(debt.toHexString()))
    }
    newDebt.Asset = debt.toHexString()
    newDebt.Amount = debtAmount
    vault.Debt = (id.concat("-").concat(debt.toHexString()))
    currentDebt.Amount = BigZero
    newDebt.save()
  } else if (debtAmount != currentDebt.Amount) {
    currentDebt.Amount = debtAmount
  }
  currentDebt.save()
  vault.save()
}

export function handleYTChange2(index: BigInt, user: string, id: string, factoryAddress: string): void {
  getUser(user)
  let vault = getYTVault(id, user, 2)
  let factory = Address.fromString(factoryAddress)
  let vaultFactory = DBSFVaultFactory.bind(factory)
  let realAddress = Address.fromString(user)
  let res = vaultFactory.YTvaults(realAddress, index)
  let collateral = res.value0
  let debt = res.value1
  let collateralAmountYield = res.value2
  let collateralAmountBond = res.value3
  let debtAmount = res.value4
  let currentCollateral = YTVaultCollateral.load(vault.Collateral)!
  if (vault.Collateral != (id.concat("-").concat(collateral.toHexString()))) {
    let newCollateral = YTVaultCollateral.load(id.concat("-").concat(collateral.toHexString()))!
    if (!newCollateral) {
      newCollateral = new YTVaultCollateral(id.concat("-").concat(collateral.toHexString()))
    }
    newCollateral.Pool = collateral.toHexString()
    newCollateral.BondSupplied = collateralAmountBond
    newCollateral.YieldSupplied = collateralAmountYield
    vault.Collateral = (id.concat("-").concat(collateral.toHexString()))
    currentCollateral.BondSupplied = BigZero
    currentCollateral.YieldSupplied = BigZero
    newCollateral.save()
  } else if (collateralAmountYield != currentCollateral.YieldSupplied || collateralAmountBond != currentCollateral.BondSupplied) {
    currentCollateral.YieldSupplied = collateralAmountYield
    currentCollateral.BondSupplied = collateralAmountBond
  }
  currentCollateral.save()
  let currentDebt = YTVaultDebt.load(vault.Debt)!
  if (vault.Debt != (id.concat("-").concat(debt.toHexString()))) {
    let newDebt = YTVaultDebt.load(id.concat("-").concat(debt.toHexString()))
    if (!newDebt) {
      newDebt = new YTVaultDebt(id.concat("-").concat(debt.toHexString()))
    }
    newDebt.Pool = debt.toHexString()
    newDebt.ZCBBorrowed = debtAmount
    vault.Debt = (id.concat("-").concat(debt.toHexString()))
    currentDebt.ZCBBorrowed = BigZero
    newDebt.save()
  } else if (debtAmount != currentDebt.ZCBBorrowed) {
    currentDebt.ZCBBorrowed = debtAmount
  }
  currentDebt.save()
  vault.save()
}

export function handleChange3(index: BigInt, user: string, id: string, factoryAddress: string): void {
  getUser(user)
  let vault = getVault(id, user, 3)
  let factory = Address.fromString(factoryAddress)
  let vaultFactory = NSFVaultFactory.bind(factory)
  let realAddress = Address.fromString(user)
  let res = vaultFactory.vaults(realAddress, index)
  let collateral = res.value0
  let debt = res.value1
  let collateralAmount = res.value2
  let debtAmount = res.value3
  let currentCollateral = VaultCollateral.load(vault.Collateral)!
  if (vault.Collateral != (id.concat("-").concat(collateral.toHexString()))) {
    let newCollateral = VaultCollateral.load(id.concat("-").concat(collateral.toHexString()))!
    if (!newCollateral) {
      newCollateral = new VaultCollateral(id.concat("-").concat(collateral.toHexString()))
    }
    let type = determineCollateralType(collateral.toHexString(), factoryAddress)
    if (type == 1) {
      newCollateral.AssetType = "ZCB"
    } else if(type == 2) {
      newCollateral.AssetType = "ERC20"
    } else {
      newCollateral.AssetType = "Wrapper"
    }
    newCollateral.Asset = collateral.toHexString()
    newCollateral.Amount = collateralAmount
    vault.Collateral = (id.concat("-").concat(collateral.toHexString()))
    currentCollateral.Amount = BigZero
    newCollateral.save()
  } else if (collateralAmount != currentCollateral.Amount) {
    currentCollateral.Amount = collateralAmount
  }
  currentCollateral.save()
  let currentDebt = VaultDebt.load(vault.Debt)!
  if (vault.Debt != (id.concat("-").concat(debt.toHexString()))) {
    let newDebt = VaultDebt.load(id.concat("-").concat(debt.toHexString()))!
    if (!newDebt) {
      newDebt = new VaultDebt(id.concat("-").concat(debt.toHexString()))
    }
    newDebt.Asset = debt.toHexString()
    newDebt.Amount = debtAmount
    vault.Debt = (id.concat("-").concat(debt.toHexString()))
    currentDebt.Amount = BigZero
    newDebt.save()
  } else if (debtAmount != currentDebt.Amount) {
    currentDebt.Amount = debtAmount
  }
  currentDebt.save()
  vault.save()
}

export function handleYTChange3(index: BigInt, user: string, id: string, factoryAddress: string): void {
  getUser(user)
  let vault = getYTVault(id, user, 3)
  let factory = Address.fromString(factoryAddress)
  let vaultFactory = DBSFVaultFactory.bind(factory)
  let realAddress = Address.fromString(user)
  let res = vaultFactory.YTvaults(realAddress, index)
  let collateral = res.value0
  let debt = res.value1
  let collateralAmountYield = res.value2
  let collateralAmountBond = res.value3
  let debtAmount = res.value4
  let currentCollateral = YTVaultCollateral.load(vault.Collateral)!
  if (vault.Collateral != (id.concat("-").concat(collateral.toHexString()))) {
    let newCollateral = YTVaultCollateral.load(id.concat("-").concat(collateral.toHexString()))!
    if (!newCollateral) {
      newCollateral = new YTVaultCollateral(id.concat("-").concat(collateral.toHexString()))
    }
    newCollateral.Pool = collateral.toHexString()
    newCollateral.BondSupplied = collateralAmountBond
    newCollateral.YieldSupplied = collateralAmountYield
    vault.Collateral = (id.concat("-").concat(collateral.toHexString()))
    currentCollateral.BondSupplied = BigZero
    currentCollateral.YieldSupplied = BigZero
    newCollateral.save()
  } else if (collateralAmountYield != currentCollateral.YieldSupplied || collateralAmountBond != currentCollateral.BondSupplied) {
    currentCollateral.YieldSupplied = collateralAmountYield
    currentCollateral.BondSupplied = collateralAmountBond
  }
  currentCollateral.save()
  let currentDebt = YTVaultDebt.load(vault.Debt)!
  if (vault.Debt != (id.concat("-").concat(debt.toHexString()))) {
    let newDebt = YTVaultDebt.load(id.concat("-").concat(debt.toHexString()))
    if (!newDebt) {
      newDebt = new YTVaultDebt(id.concat("-").concat(debt.toHexString()))
    }
    newDebt.Pool = debt.toHexString()
    newDebt.ZCBBorrowed = debtAmount
    vault.Debt = (id.concat("-").concat(debt.toHexString()))
    currentDebt.ZCBBorrowed = BigZero
    newDebt.save()
  } else if (debtAmount != currentDebt.ZCBBorrowed) {
    currentDebt.ZCBBorrowed = debtAmount
  }
  currentDebt.save()
  vault.save()
}