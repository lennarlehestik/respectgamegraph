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
} from "../generated/schema"

export function handleCommunityStateChanged(event: CommunityStateChangedEvent): void {
  let entity = new CommunityStateChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.communityId = event.params.communityId
  entity.newState = event.params.newState
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  let communityId = event.params.communityId.toString()
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
  let entity = new SubmissionToContributionTransition(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  
  // Log the idWeek for debugging purposes
  log.info("FOUND IDWEEK: {}", [event.params.idWeek.toString()]);

  entity.idWeek = event.params.idWeek.toString();
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Split the idWeek and extract the communityId
  let parts = event.params.idWeek.toString().split('-');

  if (parts.length > 0) {
    let communityId = parts[0].trim();  // Trim any extra spaces from communityId

    // Log the communityId for debugging
    log.info('Attempting to load community with ID: {}', [communityId]);

    // Load the community by ID (make sure the ID in the entity was set using toString())
    let community = Community.load(communityId);

    if (community) {
      // Create a new game and update the community's games list
      let newGame = communityId + ' - ' + community.games.length.toString();
      let games = community.games;
      games.push(newGame);
      community.games = games;
      community.currentGame = newGame;
      community.save();

      log.info('Updated games for community {}: new game {}', [communityId, newGame]);
    } else {
      // Log a warning if the community isn't found
      log.warning('Community not found when updating games for ID: {}', [communityId]);
    }
  } else {
    // Log a warning if idWeek format is invalid
    log.warning('Invalid idWeek format: {}', [event.params.idWeek.toString()]);
  }
}


function extractCommunityId(idWeek: string): string | null {
  // Implement a more robust method to extract the community ID
  // This could involve regex, specific string parsing, or other methods
  // depending on the exact format of idWeek
  let parts = idWeek.split('-')
  return parts.length > 0 ? parts[0].trim() : null
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