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

function removeSpaces(str: string): string {
  return str.split(' ').join('');
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
          community.save();
        }

        log.info('Updated games for community {}: new game {}', [communityId, idWeek]);
      } else {
        log.info('Game already exists for community {}: game {}', [communityId, idWeek]);
      }
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