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
    event.transaction.hash.concatI32(event.logIndex.toI32())
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
  let entity = new RankingSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
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
      // Update community state or other relevant data
      // For example, you might want to increment a counter for submitted rankings
      if (community.submittedRankingsCount) {
        community.submittedRankingsCount = community.submittedRankingsCount + 1
      } else {
        community.submittedRankingsCount = 1
      }
      community.save()
    } else {
      log.warning('Community not found when updating ranking submission: {}', [communityId])
    }
  } else {
    log.warning('Invalid eventId format in RankingSubmitted: {}', [event.params.eventId])
  }
}