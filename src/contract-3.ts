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

function removeSpaces(str: string): string {
  return str.split(' ').join('');
}

export function handleContributionSubmitted(event: ContributionSubmittedEvent): void {
  let entityId = removeSpaces(event.params.contributionId)
  let entity = new ContributionSubmitted(entityId)
  
  entity.contributionId = entityId

  // Extract game ID from contributionId
  let parts = entityId.split('-')
  if (parts.length >= 2) {
    let gameId = parts[0] + '-' + parts[1]
    entity.game = gameId
    
    let game = WeeklyGroupsCreated.load(gameId)
    if (game) {
      // Find the correct room for this contribution
      for (let i = 0; i < game.roomIds.length; i++) {
        let roomId = game.roomIds[i]
        let room = NewGroupsCreated.load(roomId)
        if (room && room.memberAddresses.includes(parts[2])) {
          let contributionStrings = room.contributionStrings
          contributionStrings.push(entityId)
          room.contributionStrings = contributionStrings
          room.save()
          break
        }
      }
    } else {
      log.warning('Game not found when submitting contribution: {}', [gameId])
    }
  }

  let contributions: string[] = []

  for (let i = 0; i < event.params.contributions.length; i++) {
    let contributionId = removeSpaces(entityId + "-" + i.toString())
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
  log.info('New groups created event detected. Transaction hash: {}, Event ID: {}', [event.transaction.hash.toHexString(), event.params.eventId])

  let entityId = removeSpaces(event.params.eventId)
  let entity = new NewGroupsCreated(entityId)

  entity.eventId = entityId
  entity.contributionStrings = []
  entity.rankingStrings = []
  entity.memberAddresses = event.params.memberAddresses

  // Extract game ID (communityAndWeekId) from eventId
  let parts = entityId.split('-')
  if (parts.length >= 3) {
    let communityId = parts[0]
    let weekNumber = parts[1]
    let gameId = removeSpaces(communityId + '-' + weekNumber)
    
    entity.game = gameId
    
    let game = WeeklyGroupsCreated.load(gameId)
    if (game == null) {
      // If the game doesn't exist, create it
      game = new WeeklyGroupsCreated(gameId)
      game.communityAndWeekId = gameId
      game.weekNumber = weekNumber
      game.community = communityId
      game.roomIds = []
      game.roomIdentifiers = []
      game.blockNumber = event.block.number
      game.blockTimestamp = event.block.timestamp
      game.transactionHash = event.transaction.hash
      
      // Update the community
      let community = Community.load(communityId)
      if (community) {
        let games = community.games
        if (!games.includes(gameId)) {
          games.push(gameId)
          community.games = games
          community.currentGame = gameId
          community.save()
        }
      }
      
      log.info('Created new game. Game ID: {}', [gameId])
    }
    
    let roomIds = game.roomIds
    if (!roomIds.includes(entityId)) {
      roomIds.push(entityId)
      game.roomIds = roomIds
      game.save()
    }
    log.info('Game updated with new room. Game ID: {}, Room ID: {}', [gameId, entityId])
  } else {
    log.error('Invalid eventId format in NewGroupsCreated: {}', [entityId])
  }

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  log.info('New groups created entity saved successfully. Room ID: {}', [entityId])
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

export function handleWeeklyGroupsCreated(event: WeeklyGroupsCreatedEvent): void {
  log.info('Weekly groups created event detected. Transaction hash: {}, Community and Week ID: {}', [event.transaction.hash.toHexString(), event.params.communityAndWeekId]);

  let entityId = removeSpaces(event.params.communityAndWeekId);
  let entity = WeeklyGroupsCreated.load(entityId);

  if (entity == null) {
    entity = new WeeklyGroupsCreated(entityId);
  }

  entity.communityAndWeekId = entityId;
  entity.roomIds = event.params.roomIds.map<string>((id: string) => removeSpaces(id));
  entity.roomIdentifiers = event.params.roomIdentifiers;
  entity.weekNumber = event.params.weekNumber;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  // Extract community ID from communityAndWeekId
  let parts = entityId.split('-');
  if (parts.length >= 2) {
    let communityId = parts[0];
    entity.community = communityId;
    
    let community = Community.load(communityId);
    if (community) {
      let games = community.games;
      if (!games.includes(entityId)) {
        games.push(entityId);
        community.games = games;
        community.currentGame = entityId;
        community.save();
      }
      log.info('Community updated with weekly group. Community ID: {}, Game ID: {}', [communityId, entityId]);
    } else {
      log.error('Community not found when creating weekly groups. Community ID: {}', [communityId]);
    }
  } else {
    log.error('Invalid communityAndWeekId format in WeeklyGroupsCreated: {}', [entityId]);
  }

  entity.save();

  log.info('Weekly groups created entity saved successfully. Game ID: {}', [entityId]);
}