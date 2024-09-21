import {
  ContributionSubmitted as ContributionSubmittedEvent,
  Initialized as InitializedEvent,
  NewGroupsCreated as NewGroupsCreatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  RespectUpdated as RespectUpdatedEvent,
  Upgraded as UpgradedEvent,
  WeeklyGroupsCreated as WeeklyGroupsCreatedEvent
} from "../generated/Contract3/Contract3"
import {
  ContributionSubmitted,
  Contribution,
  Initialized,
  NewGroupsCreated,
  OwnershipTransferred,
  RespectUpdated,
  Upgraded,
  WeeklyGroupsCreated,
  Community
} from "../generated/schema"
import { Bytes, BigInt, log } from "@graphprotocol/graph-ts"
import { Address } from "@graphprotocol/graph-ts"

export function handleContributionSubmitted(event: ContributionSubmittedEvent): void {
  let entityId = event.params.contributionId
  let entity = new ContributionSubmitted(entityId)
  
  entity.contributionId = event.params.contributionId

  // Extract room ID from contributionId
  let parts = event.params.contributionId.split('-')
  if (parts.length >= 3) {
    let roomId = parts[0] + '-' + parts[1] + '-' + parts[2]
    entity.room = roomId
  }

  let contributions: string[] = []

  for (let i = 0; i < event.params.contributions.length; i++) {
    let contributionId = entityId + "-" + i.toString()
    let contribution = new Contribution(contributionId)
    contribution.name = event.params.contributions[i].name
    contribution.description = event.params.contributions[i].description
    contribution.links = event.params.contributions[i].links
    contribution.save()

    contributions.push(contribution.id)
  }

  entity.contributions = contributions
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
    event.params.eventId
  )

  entity.eventId = event.params.eventId
  entity.contributionStrings = event.params.contributionStrings
  entity.rankingStrings = event.params.rankingStrings
  entity.memberAddresses = event.params.memberAddresses

  // Extract game ID (communityAndWeekId) from eventId
  let parts = event.params.eventId.split('-')
  if (parts.length >= 2) {
    let communityId = parts[0].trim()
    let weekNumber = parts[1].trim()
    let gameId = communityId + '-' + weekNumber
    
    entity.game = gameId
    
    let game = WeeklyGroupsCreated.load(gameId)
    if (game) {
      let roomIds = game.roomIds
      roomIds.push(event.params.eventId)
      game.roomIds = roomIds
      game.save()
      log.debug('Game updated with new room: {}', [gameId])
    } else {
      log.warning('Game not found when creating new groups: {}', [gameId])
    }
  } else {
    log.warning('Invalid eventId format in NewGroupsCreated: {}', [event.params.eventId])
  }

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
    event.params.user.toHexString() + "-" + event.params.communityId.toString() + "-" + event.params.weekNumber.toString()
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

export function handleWeeklyGroupsCreated(event: WeeklyGroupsCreatedEvent): void {
  log.debug('Weekly groups created event detected. Transaction hash: {}', [event.transaction.hash.toHexString()])

  let entity = new WeeklyGroupsCreated(
    event.params.communityAndWeekId
  )

  entity.communityAndWeekId = event.params.communityAndWeekId
  entity.roomIds = event.params.roomIds
  entity.roomIdentifiers = event.params.roomIdentifiers
  entity.weekNumber = event.params.weekNumber

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // Extract community ID from communityAndWeekId
  let parts = event.params.communityAndWeekId.split('-')
  if (parts.length > 0) {
    let communityId = parts[0].trim()
    entity.community = communityId
    
    let community = Community.load(communityId)
    if (community) {
      let games = community.games
      games.push(event.params.communityAndWeekId)
      community.games = games
      community.currentGame = event.params.communityAndWeekId
      community.save()
      log.debug('Community updated with new weekly group: {}', [communityId])
    } else {
      log.warning('Community not found when creating weekly groups: {}', [communityId])
    }
  } else {
    log.warning('Invalid communityAndWeekId format in WeeklyGroupsCreated: {}', [event.params.communityAndWeekId])
  }

  entity.save()

  log.debug('Weekly groups created entity saved successfully', [])
}