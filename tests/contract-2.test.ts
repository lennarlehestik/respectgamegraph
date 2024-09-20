import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { CommunityStateChanged } from "../generated/schema"
import { CommunityStateChanged as CommunityStateChangedEvent } from "../generated/Contract2/Contract2"
import { handleCommunityStateChanged } from "../src/contract-2"
import { createCommunityStateChangedEvent } from "./contract-2-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let communityId = BigInt.fromI32(234)
    let newState = 123
    let newCommunityStateChangedEvent = createCommunityStateChangedEvent(
      communityId,
      newState
    )
    handleCommunityStateChanged(newCommunityStateChangedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CommunityStateChanged created and stored", () => {
    assert.entityCount("CommunityStateChanged", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CommunityStateChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "communityId",
      "234"
    )
    assert.fieldEquals(
      "CommunityStateChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newState",
      "123"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
