import { log, BigInt } from '@graphprotocol/graph-ts'
import {
  CommunityStateChanged as CommunityStateChangedEvent,
  Initialized as InitializedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  SubmissionToContributionTransition as SubmissionToContributionTransitionEvent,
  Upgraded as UpgradedEvent,
} from "../generated/Contract2/Contract2"
import {
  Community,
  CommunityStateChanged,
  Initialized,
  OwnershipTransferred,
  SubmissionToContributionTransition,
  Upgraded,
  WeeklyGroupsCreated
} from "../generated/schema"
import { RankingtoSubmission as RankingtoSubmissionEvent } from "../generated/Contract2/Contract2"
import { RankingtoSubmission} from "../generated/schema"

function removeSpaces(str: string): string {
  return str.split(' ').join('');
}

function generateGameId(communityId: string, weekNumber: string): string {
  return communityId + "-" + weekNumber;
}

export function handleRankingtoSubmission(event: RankingtoSubmissionEvent): void {
  let id = event.params.communityId.toString()
  let entity = new RankingtoSubmission(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.communityId = id
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  // Update community state and create new game
  let community = Community.load(id)
  if (community) {
    // Change state to submission phase
    community.state = BigInt.fromI32(0)

    // Create new game
    let currentGameId = community.currentGame
    let currentGame = WeeklyGroupsCreated.load(currentGameId)
    
    if (currentGame) {
      let currentWeekNumber = parseInt(currentGame.weekNumber) as i32
      let nextWeekNumber = (currentWeekNumber + 1).toString()
      let nextGameId = generateGameId(id, nextWeekNumber)

      let nextGame = new WeeklyGroupsCreated(nextGameId)
      nextGame.communityAndWeekId = nextGameId
      nextGame.weekNumber = nextWeekNumber
      nextGame.community = id
      nextGame.roomIds = []
      nextGame.roomIdentifiers = []
      nextGame.blockNumber = event.block.number
      nextGame.blockTimestamp = event.block.timestamp
      nextGame.transactionHash = event.transaction.hash
      nextGame.save()

      // Update community
      let games = community.games
      games.push(nextGameId)
      community.games = games
      community.currentGame = nextGameId
      community.submittedRankingsCount = 0 // Reset ranking count for new game

      community.save()
      
      log.info('Updated community {} state to 0 (submission phase) and created new game {}', [id, nextGameId])
    } else {
      log.warning('Current game not found for community {} when transitioning to submission phase', [id])
    }
  } else {
    log.warning('Community not found when updating state to submission phase: {}', [id])
  }
}

export function handleCommunityStateChanged(event: CommunityStateChangedEvent): void {
  let entity = new CommunityStateChanged(
    event.params.communityId.toString() + "-" + event.block.number.toString()
  )
  entity.communityId = event.params.communityId
  entity.newState = event.params.newState
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  let communityId = removeSpaces(event.params.communityId.toString())
  let community = Community.load(communityId)
  if (community) {
    community.state = BigInt.fromI32(event.params.newState)
    community.save()
    log.info('Updated state for community {}: new state {}', [communityId, event.params.newState.toString()])
  } else {
    log.warning('Community not found when updating state: {}', [communityId])
  }
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

export function handleSubmissionToContributionTransition(event: SubmissionToContributionTransitionEvent): void {
  let idWeek = removeSpaces(event.params.idWeek.toString());
  
  let entity = new SubmissionToContributionTransition(idWeek);
  entity.idWeek = idWeek;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  log.info("FOUND IDWEEK: {}", [idWeek]);

  let parts = idWeek.split('-');

  if (parts.length >= 2) {
    let communityId = parts[0];
    let weekNumber = parts[1];

    log.info('Attempting to load community with ID: {}', [communityId]);

    let community = Community.load(communityId);

    if (community) {
      // Change community state to 1
      community.state = BigInt.fromI32(1);

      let game = WeeklyGroupsCreated.load(idWeek);
      if (game == null) {
        game = new WeeklyGroupsCreated(idWeek);
        game.communityAndWeekId = idWeek;
        game.weekNumber = weekNumber;
        game.community = communityId;
        game.roomIds = [];
        game.roomIdentifiers = [];
        game.blockNumber = event.block.number;
        game.blockTimestamp = event.block.timestamp;
        game.transactionHash = event.transaction.hash;
        game.save();

        let games = community.games;
        if (!games.includes(idWeek)) {
          games.push(idWeek);
          community.games = games;
          community.currentGame = idWeek;
        }
      } else {
        log.info('Game already exists for community {}: game {}', [communityId, idWeek]);
      }

      // Save the community after all updates
      community.save();

      log.info('Updated community {}: new state 1, current game {}', [communityId, idWeek]);
    } else {
      log.warning('Community not found when updating games for ID: {}', [communityId]);
    }
  } else {
    log.warning('Invalid idWeek format: {}', [idWeek]);
  }
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