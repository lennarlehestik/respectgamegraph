import {
  CommunityCreated as CommunityCreatedEvent,
  Initialized as InitializedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Upgraded as UpgradedEvent
} from "../generated/Contract/Contract"
import {
  Community,
  CommunityCreated,
  Initialized,
  OwnershipTransferred,
  Upgraded
} from "../generated/schema"
import { BigInt } from '@graphprotocol/graph-ts'

function removeSpaces(str: string): string {
  return str.split(' ').join('');
}

export function handleCommunityCreated(event: CommunityCreatedEvent): void {
  let communityId = removeSpaces(event.params.communityId.toString())
  let entity = new CommunityCreated(communityId)
  
  entity.communityId = event.params.communityId
  entity.name = event.params.name
  entity.description = event.params.description
  entity.imageUrl = event.params.imageUrl
  entity.games = removeSpaces(event.params.games)
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  let community = new Community(communityId)
  community.communityId = event.params.communityId
  community.name = event.params.name
  community.description = event.params.description
  community.imageUrl = event.params.imageUrl
  community.games = [removeSpaces(event.params.games)]
  community.currentGame = removeSpaces(event.params.games)
  community.state = BigInt.fromI32(0) // Set initial state to 0 as BigInt
  community.createdAt = event.block.timestamp
  community.createdAtBlock = event.block.number
  community.transactionHash = event.transaction.hash
  community.save()
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