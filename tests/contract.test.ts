import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { CommunityCreated } from "../generated/schema"
import { CommunityCreated as CommunityCreatedEvent } from "../generated/Contract/Contract"
import { handleCommunityCreated } from "../src/contract"
import { createCommunityCreatedEvent } from "./contract-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let communityId = BigInt.fromI32(234)
    let name = "Example string value"
    let description = "Example string value"
    let imageUrl = "Example string value"
    let games = "Example string value"
    let newCommunityCreatedEvent = createCommunityCreatedEvent(
      communityId,
      name,
      description,
      imageUrl,
      games
    )
    handleCommunityCreated(newCommunityCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CommunityCreated created and stored", () => {
    assert.entityCount("CommunityCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CommunityCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "communityId",
      "234"
    )
    assert.fieldEquals(
      "CommunityCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "name",
      "Example string value"
    )
    assert.fieldEquals(
      "CommunityCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "description",
      "Example string value"
    )
    assert.fieldEquals(
      "CommunityCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "imageUrl",
      "Example string value"
    )
    assert.fieldEquals(
      "CommunityCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "games",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
