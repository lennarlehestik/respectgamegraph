import {
  ContributionSubmitted as ContributionSubmittedEvent,
  Initialized as InitializedEvent,
  NewGroupsCreated as NewGroupsCreatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  RespectUpdated as RespectUpdatedEvent,
  Upgraded as UpgradedEvent
} from "../generated/Contract3/Contract3"
import {
  ContributionSubmitted,
  Contribution,
  Initialized,
  NewGroupsCreated,
  OwnershipTransferred,
  RespectUpdated,
  Upgraded
} from "../generated/schema"
import { Bytes, BigInt, log} from "@graphprotocol/graph-ts"
import { Address } from "@graphprotocol/graph-ts"

export function handleContributionSubmitted(event: ContributionSubmittedEvent): void {
  let entity = new ContributionSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.communityId = event.params.communityId
  entity.weekNumber = event.params.weekNumber

  let contributions: string[] = []

  for (let i = 0; i < event.params.contributions.length; i++) {
    let contribution = new Contribution(
      event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString() + "-" + i.toString()
    )
    contribution.name = event.params.contributions[i].name
    contribution.description = event.params.contributions[i].description
    contribution.links = event.params.contributions[i].links
    contribution.save()

    contributions.push(contribution.id)
  }

  entity.contributionIds = contributions
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}


export function handleNewGroupsCreated(event: NewGroupsCreatedEvent): void {
  log.debug('New groups created event detected. Transaction hash: {}', [event.transaction.hash.toHexString()])

  let entity = new NewGroupsCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.eventId = event.params.eventId
  entity.contributionStrings = event.params.contributionStrings
  entity.rankingStrings = event.params.rankingStrings
  entity.memberAddresses = event.params.memberAddresses

  log.debug('Number of member addresses: {}', [entity.memberAddresses.length.toString()])

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  log.debug('New groups created entity saved successfully', [])
}


export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRespectUpdated(event: RespectUpdatedEvent): void {
  let entity = new RespectUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.communityId = event.params.communityId
  entity.weekNumber = event.params.weekNumber
  entity.respectAmount = event.params.respectAmount
  entity.averageRespect = event.params.averageRespect

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpgraded(event: UpgradedEvent): void {
  let entity = new Upgraded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.implementation = event.params.implementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}