import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  CommunityStateChanged,
  Initialized,
  OwnershipTransferred,
  SubmissionToContributionTransition,
  Upgraded
} from "../generated/Contract2/Contract2"

export function createCommunityStateChangedEvent(
  communityId: BigInt,
  newState: i32
): CommunityStateChanged {
  let communityStateChangedEvent = changetype<CommunityStateChanged>(
    newMockEvent()
  )

  communityStateChangedEvent.parameters = new Array()

  communityStateChangedEvent.parameters.push(
    new ethereum.EventParam(
      "communityId",
      ethereum.Value.fromUnsignedBigInt(communityId)
    )
  )
  communityStateChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newState",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newState))
    )
  )

  return communityStateChangedEvent
}

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createSubmissionToContributionTransitionEvent(
  idWeek: string
): SubmissionToContributionTransition {
  let submissionToContributionTransitionEvent =
    changetype<SubmissionToContributionTransition>(newMockEvent())

  submissionToContributionTransitionEvent.parameters = new Array()

  submissionToContributionTransitionEvent.parameters.push(
    new ethereum.EventParam("idWeek", ethereum.Value.fromString(idWeek))
  )

  return submissionToContributionTransitionEvent
}

export function createUpgradedEvent(implementation: Address): Upgraded {
  let upgradedEvent = changetype<Upgraded>(newMockEvent())

  upgradedEvent.parameters = new Array()

  upgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )

  return upgradedEvent
}
