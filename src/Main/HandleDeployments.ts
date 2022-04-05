import { WrapperDeployment, OrderbookDeployment, FixCapitalPoolDeployment } from '../../generated/Organizer/Organizer'
import { WrapperAsset, User, WrapperHolding, Orderbook, FCP } from '../../generated/schema'
import { IWrapper, OrderbookExchange, FixCapitalPool } from '../../generated/templates'
import { getUser, BigZero, DEFAULT_ADDRESS } from '../helpers'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleWrapperDeployment(event: WrapperDeployment): void {
  let id = (event.params.wrapperAddress).toHexString()
  let wrapper = new WrapperAsset(id)
  let ownerId = (event.params.owner).toHexString()
  getUser(ownerId)
  wrapper.UnderlyingAsset = (event.params.underlyingAddress).toHexString()
  wrapper.Owner = ownerId
  wrapper.Supply = BigZero
  wrapper.WrapperType = event.params.wrapperType
  wrapper.save()
  IWrapper.create(event.params.wrapperAddress)
}

export function handleOrderbookDeployment(event: OrderbookDeployment): void {
  let id = (event.params.OrderbookAddress).toHexString()
  let orderbook = new Orderbook(id)
  let fcp = FCP.load((event.params.BaseFCPaddress).toHexString())!
  getUser(fcp.Owner)
  orderbook.Owner = fcp.Owner
  orderbook.Pool = (event.params.BaseFCPaddress).toHexString()
  orderbook.ZCBsellHead = ""
  orderbook.YTsellHead = ""
  orderbook.AvailableYTsells = BigZero
  orderbook.AvailableZCBsells = BigZero
  orderbook.YTsells = []
  orderbook.ZCBsells = []
  orderbook.save()
  OrderbookExchange.create(event.params.OrderbookAddress)
}

export function handleFCPdeployment(event: FixCapitalPoolDeployment): void {
  let id = (event.params.FCPaddress).toHexString()
  let pool = new FCP(id)
  getUser((event.params.owner).toHexString())
  pool.Owner = (event.params.owner).toHexString()
  pool.Wrapper = (event.params.BaseWrapperAddress).toHexString()
  pool.Maturity = event.params.maturity
  pool.save()
  FixCapitalPool.create(event.params.FCPaddress)
}