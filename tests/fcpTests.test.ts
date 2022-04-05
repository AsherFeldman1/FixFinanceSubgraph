import { clearStore, test, assert } from "matchstick-as/assembly/index"
import { logStore } from "matchstick-as/assembly/store"
import { log } from "matchstick-as/assembly/log"
import { handleDeposit, handleWithdrawal, handleBondBalanceUpdated, handleBalanceUpdated, handlePayoutClaimed } from "../src/Main/FCPmappings"
import { newFCPDeposit, newFCP, newFCPWithdrawal, newBondBalanceUpdate, newBalanceUpdate, newClaimPayout } from "./testUtils"
import { handleFCPdeployment } from "../src/Main/HandleDeployments"

test("deploy FCP and deposit in it", () => {
	let newFCPEvent = newFCP(
		"0x0000000000000000000000000000000000000001",
		"0x0000000000000000000000000000000000000002",
		"0x0000000000000000000000000000000000000003",
		1
	)
	handleFCPdeployment(newFCPEvent)
	let newDeposit = newFCPDeposit("0x0000000000000000000000000000000000000003", "0x0000000000000000000000000000000000000001", 10)
	handleDeposit(newDeposit)
	assert.fieldEquals("FCPholding", "0x0000000000000000000000000000000000000003-0x0000000000000000000000000000000000000001",
		"YieldAmount", "10")
	assert.fieldEquals("FCPholding", "0x0000000000000000000000000000000000000003-0x0000000000000000000000000000000000000001",
		"BondAmount", "0")
})

test("Withdraw from FCP", () => {
	let newWithdrawal = newFCPWithdrawal("0x0000000000000000000000000000000000000003", "0x0000000000000000000000000000000000000001", 2)
	handleWithdrawal(newWithdrawal)
	assert.fieldEquals("FCPholding", "0x0000000000000000000000000000000000000003-0x0000000000000000000000000000000000000001",
		"YieldAmount", "8")
	assert.fieldEquals("FCPholding", "0x0000000000000000000000000000000000000003-0x0000000000000000000000000000000000000001",
		"BondAmount", "0")
})

test("Bond balance gets updated", () => {
	let newBondBalanceUpdateEvent = newBondBalanceUpdate("0x0000000000000000000000000000000000000003",
	 "0x0000000000000000000000000000000000000001", 11)
	handleBondBalanceUpdated(newBondBalanceUpdateEvent)
	assert.fieldEquals("FCPholding", "0x0000000000000000000000000000000000000003-0x0000000000000000000000000000000000000001",
		"BondAmount", "11")
	assert.fieldEquals("FCPholding", "0x0000000000000000000000000000000000000003-0x0000000000000000000000000000000000000001",
		"YieldAmount", "8")
})

test("Both balance updated", () => {
	let newBalanceUpdateEvent = newBalanceUpdate("0x0000000000000000000000000000000000000003",
	 "0x0000000000000000000000000000000000000001", 10, 10)
	handleBalanceUpdated(newBalanceUpdateEvent)
	assert.fieldEquals("FCPholding", "0x0000000000000000000000000000000000000003-0x0000000000000000000000000000000000000001",
		"BondAmount", "10")
	assert.fieldEquals("FCPholding", "0x0000000000000000000000000000000000000003-0x0000000000000000000000000000000000000001",
		"YieldAmount", "10")
})

test("Payout claimed", () => {
	let newClaimPayoutEvent = newClaimPayout("0x0000000000000000000000000000000000000003", "0x0000000000000000000000000000000000000001")
	handlePayoutClaimed(newClaimPayoutEvent)
	assert.fieldEquals("FCPholding", "0x0000000000000000000000000000000000000003-0x0000000000000000000000000000000000000001",
		"BondAmount", "0")
	assert.fieldEquals("FCPholding", "0x0000000000000000000000000000000000000003-0x0000000000000000000000000000000000000001",
		"YieldAmount", "0")
})