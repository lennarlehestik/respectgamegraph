import {
  ConsensusReached as ConsensusReachedEvent,
  RankingSubmitted as RankingSubmittedEvent
} from "../generated/Contract4/Contract4"
import {
  ConsensusReached,
  RankingSubmitted,
  Community,
  WeeklyGroupsCreated,
  NewGroupsCreated
} from "../generated/schema"
import { log } from '@graphprotocol/graph-ts'

function removeSpaces(str: string): string {
  return str.split(' ').join('');
}

export function handleConsensusReached(event: ConsensusReachedEvent): void {
  let entityId = removeSpaces(event.params.compositeId)
  let entity = new ConsensusReached(entityId)
  entity.compositeId = entityId
  entity.finalRanking = event.params.finalRanking

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Extract community ID from compositeId
  let parts = entityId.split('-')
  if (parts.length > 0) {
    let communityId = parts[0]
    let community = Community.load(communityId)
    if (community) {
      // Update community state or other relevant data
      // For example, you might want to store the latest consensus result
      community.latestConsensus = entityId
      community.save()
    } else {
      log.warning('Community not found when updating consensus: {}', [communityId])
    }
  } else {
    log.warning('Invalid compositeId format in ConsensusReached: {}', [entityId])
  }
}

export function handleRankingSubmitted(event: RankingSubmittedEvent): void {
  let entityId = removeSpaces(event.params.eventId)
  let entity = new RankingSubmitted(entityId)
  
  entity.eventId = entityId
  entity.ranking = event.params.ranking

  // Extract game ID from eventId
  let parts = entityId.split('-')
  if (parts.length >= 2) {
    let gameId = parts[0] + '-' + parts[1]
    entity.game = gameId
    
    let game = WeeklyGroupsCreated.load(gameId)
    if (game) {
      // Find the correct room for this ranking
      let roomIds = game.roomIds
      for (let i = 0; i < roomIds.length; i++) {
        let roomId = roomIds[i]
        let room = NewGroupsCreated.load(roomId)
        if (room) {
          let memberAddresses = room.memberAddresses
          if (memberAddresses.includes(parts[2])) {
            let rankingStrings = room.rankingStrings
            rankingStrings.push(entityId)
            room.rankingStrings = rankingStrings
            room.save()
            break
          }
        }
      }

      let community = Community.load(parts[0])
      if (community) {
        let count = community.submittedRankingsCount
        if (count) {
          community.submittedRankingsCount = count + 1
        } else {
          community.submittedRankingsCount = 1
        }
        community.save()
      }
    } else {
      log.warning('Game not found when submitting ranking: {}', [gameId])
    }
  } else {
    log.error('Invalid eventId format in RankingSubmitted: {}', [entityId])
  }

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}