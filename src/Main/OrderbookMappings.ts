import { MakeLimitSellYT, MakeLimitSellZCB, ModifyOrder, MarketBuyYT, MarketBuyZCB,
Deposit, Withdrawal } from '../../generated/templates/OrderbookExchange/OrderbookExchange'
import { User, WrapperAsset, WrapperHolding, Orderbook, FCP,
ZCBsell, YTsell, FCPholding, OrderbookPosition } from '../../generated/schema'
import { FixCapitalPool } from '../../generated/templates/FixCapitalPool/FixCapitalPool'
import { getUser, BigZero, BigOne, getOrInitFCPholding, getOrderbookPosition } from '../helpers'
import { OrderbookExchange } from '../../generated/templates/OrderbookExchange/OrderbookExchange'
import { BigInt, Address } from '@graphprotocol/graph-ts'
import { log } from "matchstick-as/assembly/log"

export function handleOrderBookDeposit(event: Deposit): void {
  let book = Orderbook.load((event.address).toHexString())!
  let positionID = (event.params.to).toHexString().concat("-").concat(book.Pool)
  let position = getOrderbookPosition(positionID, (event.params.to).toHexString(), book.id)
  position.DepositedBondAmount = position.DepositedBondAmount.plus(event.params.bondDeposit)
  position.DepositedYieldAmount = position.DepositedYieldAmount.plus(event.params.yieldDeposit)
  position.save()
}

export function handleOrderBookWithdrawal(event: Withdrawal): void {
  let book = Orderbook.load((event.address).toHexString())!
  let positionID = (event.params.from).toHexString().concat("-").concat(book.Pool);
  let position = getOrderbookPosition(positionID, (event.params.from).toHexString(), book.id)
  position.DepositedBondAmount = position.DepositedBondAmount.minus(event.params.bondWithdrawn)
  position.DepositedYieldAmount = position.DepositedYieldAmount.minus(event.params.yieldWithdrawn)
  position.save()
}

export function handleLimitSellZCB(event: MakeLimitSellZCB): void {
  let id = (event.params.newID).toHexString().concat("-").concat((event.address).toHexString())
  let orderbook = Orderbook.load((event.address).toHexString())!
  orderbook.LockedZCB = orderbook.LockedZCB.plus(event.params.amount)
  let holdingID = (event.params.maker).toHexString().concat("-").concat(orderbook.Pool)
  let position = getOrderbookPosition(holdingID, (event.params.maker).toHexString(), (event.address).toHexString())
  position.LockedZCB = position.LockedZCB.plus(event.params.amount)
  let order = new ZCBsell(id)
  order.Amount = event.params.amount
  order.Maker = (event.params.maker).toHexString()
  order.MaturityConversionRate = event.params.maturityConversionRate
  order.orderbook = (event.address).toHexString()
  let prevOrder = ZCBsell.load((event.params.prevID).toHexString().concat("-").concat((event.address).toHexString()))
  if (!prevOrder) {
    order.PreviousOrder = ""
    if (orderbook.ZCBsellHead != "") {
      order.NextOrder = orderbook.ZCBsellHead
      let prevHead = ZCBsell.load(orderbook.ZCBsellHead)
      if (prevHead) {
        prevHead.PreviousOrder = id
        orderbook.ZCBsellHead = id
        prevHead.save()
      }
    } else {
      orderbook.ZCBsellHead = id
      order.NextOrder = ""
      order.PreviousOrder = ""
    }
  } else {
    order.PreviousOrder = (event.params.prevID).toHexString().concat("-").concat((event.address).toHexString())
    let prevNext = prevOrder.NextOrder
    prevOrder.NextOrder = id
    order.NextOrder = prevNext
    prevOrder.save()
  }
  order.Position = position.id
  orderbook.AvailableZCBsells = orderbook.AvailableZCBsells.plus(BigOne)
  orderbook.save()
  order.save()
  position.save()
}

export function handleLimitSellYT(event: MakeLimitSellYT): void {
  let id = (event.params.newID).toHexString().concat("-").concat((event.address).toHexString())
  let orderbook = Orderbook.load((event.address).toHexString())!
  orderbook.LockedYT = orderbook.LockedYT.plus(event.params.amount)
  let holdingID = (event.params.maker).toHexString().concat("-").concat(orderbook.Pool)
  let position = getOrderbookPosition(holdingID, (event.params.maker).toHexString(), (event.address).toHexString())
  position.LockedYT = position.LockedYT.plus(event.params.amount)
  let order = new YTsell(id)
  order.Amount = event.params.amount
  order.Maker = (event.params.maker).toHexString()
  order.PreviousOrder = (event.params.prevID).toHexString().concat("-").concat((event.address).toHexString())
  order.MaturityConversionRate = event.params.maturityConversionRate
  order.orderbook = (event.address).toHexString()
  let prevOrder = YTsell.load((event.params.prevID).toHexString().concat("-").concat((event.address).toHexString()))
  if (!prevOrder) {
    order.PreviousOrder = ""
    if (orderbook.YTsellHead != "") {
      order.NextOrder = orderbook.YTsellHead
      let prevHead = YTsell.load(orderbook.YTsellHead)
      if (prevHead) {
        prevHead.PreviousOrder = id
        orderbook.YTsellHead = id
        prevHead.save()
      }
    } else {
      orderbook.YTsellHead = id
      order.NextOrder = ""
      order.PreviousOrder = ""
    }
  } else {
    let prevNext = prevOrder.NextOrder
    prevOrder.NextOrder = id
    order.NextOrder = prevNext
    prevOrder.save()
  }
  order.Position = position.id
  orderbook.AvailableYTsells = orderbook.AvailableYTsells.plus(BigOne)
  orderbook.save()
  position.save()
  order.save()
}

export function handleModification(event: ModifyOrder): void {
  let id = event.params.orderID.toHexString().concat("-")
    .concat((event.address).toHexString())
  let isYTtoZCB = false
  let order = ZCBsell.load(id)
  let orderbook = Orderbook.load((event.address).toHexString())!
  if (!order) {
    let YTorder = YTsell.load(id)!
    let positionID = YTorder.Maker.concat("-").concat(orderbook.Pool)
    let position = getOrderbookPosition(positionID, YTorder.Maker, (event.address).toHexString())
    position.LockedYT = position.LockedYT.plus(event.params.change)
    if ((YTorder.Amount + event.params.change) == BigZero) {
      let prev = YTsell.load(YTorder.PreviousOrder)
      let next = YTsell.load(YTorder.NextOrder)
      if (prev) {
        prev.NextOrder = YTorder.NextOrder
      }
      if (next) {
        next.PreviousOrder = YTorder.PreviousOrder
      }
      YTorder.PreviousOrder = ""
      YTorder.NextOrder = ""
      YTorder.orderbook = ""
      YTorder.Position = ""
      YTorder.MaturityConversionRate = BigZero
    }
    YTorder.Amount = YTorder.Amount.plus(event.params.change)
    orderbook.LockedYT = orderbook.LockedYT.plus(event.params.change)
    YTorder.save()
  }
  else {
    let positionID = order.Maker.concat("-").concat(orderbook.Pool)
    let position = getOrderbookPosition(positionID, order.Maker, (event.address).toHexString())
    position.LockedZCB = position.LockedZCB.plus(event.params.change)
    if ((order.Amount + event.params.change) == BigZero) {
      let prev = ZCBsell.load(order.PreviousOrder)
      let next = ZCBsell.load(order.NextOrder)
      if (prev) {
        prev.NextOrder = order.NextOrder
      }
      if (next) {
        next.PreviousOrder = order.PreviousOrder
      }
      order.PreviousOrder = ""
      order.NextOrder = ""
      order.orderbook = ""
      order.Position = ""
      order.MaturityConversionRate = BigZero
    }
    order.Amount = order.Amount.plus(event.params.change)
    orderbook.LockedZCB = orderbook.LockedZCB.plus(event.params.change)
    order.save()
  }
  orderbook.save()
}

export function handleMarketBuyZCB(event: MarketBuyZCB): void {
  let orderbook = Orderbook.load((event.address).toHexString())!
  let holdingID = (event.params.taker).toHexString().concat("-")
    .concat(orderbook.Pool)
  let takerPosition = getOrderbookPosition(holdingID, (event.params.taker).toHexString(), (event.address).toHexString())
  let head = orderbook.ZCBsellHead
  let book = OrderbookExchange.bind(event.address)
  let depositedBond = book.BondDeposited(event.params.taker)
  let depositedYield = book.YieldDeposited(event.params.taker)
  let lockedYT = book.lockedYT(event.params.taker)
  takerPosition.DepositedYieldAmount = depositedYield
  takerPosition.DepositedBondAmount = depositedBond
  takerPosition.LockedYT = lockedYT
  while (head != (event.params.newZCBSellHeadID).toHexString().concat("-").concat((event.address).toHexString())) {
    let Head = ZCBsell.load(head)!
    let headID = (Head.Maker).concat("-").concat(orderbook.Pool)
    let depositedBond = book.BondDeposited(Address.fromString(Head.Maker))
    let depositedYield = book.YieldDeposited(Address.fromString(Head.Maker))
    let position = getOrderbookPosition(headID, Head.Maker, (event.address).toHexString())
    position.LockedZCB = position.LockedZCB.minus(Head.Amount)
    position.DepositedBondAmount = depositedBond
    position.DepositedYieldAmount = depositedYield
    Head.Amount = BigZero
    Head.PreviousOrder = ""
    Head.Maker = ""
    let oldHeadNext = Head.NextOrder
    Head.NextOrder = ""
    head = oldHeadNext
    Head.orderbook = ""
    Head.Position = ""
    orderbook.save()
    Head.save()
    position.save()
  }
  let newHead = ZCBsell.load(head)!
  let headID = (newHead.Maker).concat("-").concat(orderbook.Pool)
  let depBond = book.BondDeposited(Address.fromString(newHead.Maker))
  let depYield = book.BondDeposited(Address.fromString(newHead.Maker))
  let position = getOrderbookPosition(headID, newHead.Maker, (event.address).toHexString())
  let change = newHead.Amount - event.params.headAmount
  position.LockedZCB = position.LockedZCB.minus(change)
  position.DepositedYieldAmount = depYield
  position.DepositedBondAmount = depBond
  newHead.PreviousOrder = ""
  newHead.Amount = event.params.headAmount
  newHead.save()
  position.save()
  takerPosition.save()
}

export function handleMarketBuyYT(event: MarketBuyYT): void {
  let orderbook = Orderbook.load((event.address).toHexString())!
  let holdingID = (event.params.taker).toHexString().concat("-")
    .concat(orderbook.Pool)
  let takerPosition = getOrderbookPosition(holdingID, (event.params.taker).toHexString(), (event.address).toHexString())
  let head = orderbook.YTsellHead
  let book = OrderbookExchange.bind(event.address)
  let depositedBond = book.BondDeposited(event.params.taker)
  let depositedYield = book.YieldDeposited(event.params.taker)
  let lockedZCB = book.lockedZCB(event.params.taker)
  takerPosition.DepositedYieldAmount = depositedYield
  takerPosition.DepositedBondAmount = depositedBond
  takerPosition.LockedZCB = lockedZCB
  while (head != (event.params.newYTSellHeadID).toHexString().concat("-").concat((event.address).toHexString())) {
    let Head = YTsell.load(head)!
    let headID = (Head.Maker).concat("-").concat(orderbook.Pool)
    let depositedBond = book.BondDeposited(Address.fromString(Head.Maker))
    let depositedYield = book.YieldDeposited(Address.fromString(Head.Maker))
    let position = getOrderbookPosition(headID, Head.Maker, (event.address).toHexString())
    position.LockedYT = position.LockedYT.minus(Head.Amount)
    position.DepositedBondAmount = depositedBond
    position.DepositedYieldAmount = depositedYield
    Head.Amount = BigZero
    Head.PreviousOrder = ""
    Head.Maker = ""
    let oldHeadNext = Head.NextOrder
    Head.NextOrder = ""
    head = oldHeadNext
    Head.orderbook = ""
    Head.Position = ""
    orderbook.save()
    Head.save()
    position.save()
  }
  let newHead = YTsell.load(head)!
  let headID = (newHead.Maker).concat("-").concat(orderbook.Pool)
  let position = getOrderbookPosition(headID, newHead.Maker, (event.address).toHexString())
  let change = newHead.Amount - event.params.headAmount
  let depBond = book.BondDeposited(Address.fromString(newHead.Maker))
  let depYield = book.BondDeposited(Address.fromString(newHead.Maker))
  position.LockedZCB = position.LockedZCB.minus(change)
  position.DepositedYieldAmount = depYield
  position.DepositedBondAmount = depBond
  newHead.PreviousOrder = ""
  newHead.Amount = event.params.headAmount
  newHead.save()
  position.save()
  takerPosition.save()
}
