import {
  ConsensusReached as ConsensusReachedEvent,
  RankingSubmitted as RankingSubmittedEvent
} from "../generated/Contract4/Contract4"
import {
  ConsensusReached,
  RankingSubmitted,
  Community
} from "../generated/schema"
import { log, store } from '@graphprotocol/graph-ts'

export function handleConsensusReached(event: ConsensusReachedEvent): void {
  let entity = new ConsensusReached(
    event.params.compositeId
  )
  entity.compositeId = event.params.compositeId
  entity.finalRanking = event.params.finalRanking

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Extract community ID from compositeId
  let parts = event.params.compositeId.split('-')
  if (parts.length > 0) {
    let communityId = parts[0].trim()
    let community = Community.load(communityId)
    if (community) {
      // Update community state or other relevant data
      // For example, you might want to store the latest consensus result
      community.latestConsensus = event.params.compositeId
      community.save()
    } else {
      log.warning('Community not found when updating consensus: {}', [communityId])
    }
  } else {
    log.warning('Invalid compositeId format in ConsensusReached: {}', [event.params.compositeId])
  }
}

export function handleRankingSubmitted(event: RankingSubmittedEvent): void {
  let entityId = event.params.eventId
  let entity = new RankingSubmitted(entityId)
  
  entity.eventId = event.params.eventId
  entity.ranking = event.params.ranking
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Extract community ID from eventId
  let parts = event.params.eventId.split('-')
  if (parts.length > 0) {
    let communityId = parts[0].trim()
    let community = Community.load(communityId)
    if (community) {
      // You might want to update other community data here if needed
      community.save()
    } else {
      log.warning('Community not found when updating ranking submission: {}', [communityId])
    }
  } else {
    log.warning('Invalid eventId format in RankingSubmitted: {}', [event.params.eventId])
  }
}