import {
  CommunityCreated as CommunityCreatedEvent,
  Initialized as InitializedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Upgraded as UpgradedEvent,
  ProfileCreated as ProfileCreatedEvent,
  CommunityJoined as CommunityJoinedEvent,
  CommunityJoinApplication as CommunityJoinApplicationEvent,
  UserApproval as UserApprovalEvent
} from "../generated/Contract/Contract"
import {
  Community,
  CommunityCreated,
  Initialized,
  OwnershipTransferred,
  Upgraded,
  Profile,
  ProfileCreated,
  CommunityJoined,
  PendingMember,
  CommunityJoinApplication,
  UserApproval
} from "../generated/schema"
import { log, BigInt, Bytes } from '@graphprotocol/graph-ts'


export function handleCommunityJoined(event: CommunityJoinedEvent): void {
  let communityId = event.params.communityId.toString()
  let userAddress = event.params.user.toHexString()

  log.info(
    'User {} joined community {}',
    [userAddress, communityId]
  )

  let community = Community.load(communityId)

  if (community) {
    let memberAddresses = community.memberAddresses
    if (memberAddresses == null) {
      memberAddresses = []
    }
    memberAddresses.push(event.params.user)
    community.memberAddresses = memberAddresses
    community.save()

    log.info(
      'Updated community {} with new member. Total members: {}',
      [communityId, memberAddresses.length.toString()]
    )
  } else {
    log.warning('Community not found for id {}', [communityId])
  }

  let joinedEvent = new CommunityJoined(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  joinedEvent.user = event.params.user
  joinedEvent.communityId = event.params.communityId
  joinedEvent.blockNumber = event.block.number
  joinedEvent.blockTimestamp = event.block.timestamp
  joinedEvent.transactionHash = event.transaction.hash
  joinedEvent.save()

  log.info(
    'Created CommunityJoined event for user {} in community {}',
    [userAddress, communityId]
  )
}

export function handleProfileCreated(event: ProfileCreatedEvent): void {
  let profileId = event.params.user.toHexString()
  let profile = new Profile(profileId)
  
  profile.user = event.params.user
  profile.username = event.params.username
  profile.description = event.params.description
  profile.profilepic = event.params.profilepic
  profile.createdAt = event.block.timestamp
  profile.updatedAt = event.block.timestamp
  profile.save()

  let profileCreatedEvent = new ProfileCreated(event.transaction.hash.concatI32(event.logIndex.toI32()))
  profileCreatedEvent.user = event.params.user
  profileCreatedEvent.username = event.params.username
  profileCreatedEvent.description = event.params.description
  profileCreatedEvent.profilepic = event.params.profilepic
  profileCreatedEvent.blockNumber = event.block.number
  profileCreatedEvent.blockTimestamp = event.block.timestamp
  profileCreatedEvent.transactionHash = event.transaction.hash
  profileCreatedEvent.save()
}
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
  entity.tokenAddress = event.params.communitytoken
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
  community.state = BigInt.fromI32(0)
  community.createdAt = event.block.timestamp
  community.createdAtBlock = event.block.number
  community.transactionHash = event.transaction.hash
  community.memberAddresses = []
  community.tokenAddress = event.params.communitytoken
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

export function handleCommunityJoinApplication(event: CommunityJoinApplicationEvent): void {
  let id = event.params.user.toHexString() + '-' + event.params.communityId.toString()
  let pendingMember = new PendingMember(id)
  pendingMember.user = event.params.user
  pendingMember.communityId = event.params.communityId
  pendingMember.community = event.params.communityId.toString() // Add this line
  pendingMember.approvers = []
  pendingMember.approvalCount = BigInt.fromI32(0)
  pendingMember.status = 'Pending'
  pendingMember.save()

  // Optionally, you can also update the Community entity here if needed
  let community = Community.load(event.params.communityId.toString())
  if (community) {
    // You can add any necessary updates to the Community entity here
    community.save()
  }
}

export function handleUserApproval(event: UserApprovalEvent): void {
  let pendingMemberId = event.params.user.toHexString() + '-' + event.params.communityId.toString()
  let pendingMember = PendingMember.load(pendingMemberId)

  if (pendingMember) {
    let approvers = pendingMember.approvers
    if (approvers == null) {
      approvers = []
    }
    approvers.push(event.params.approver)
    pendingMember.approvers = approvers
    pendingMember.approvalCount = BigInt.fromI32(approvers.length)

    // Instead of removing, we update the status if necessary
    if (approvers.length >= 2) {
      pendingMember.status = 'Approved'

      // Add the user to the community's memberAddresses
      let communityId = event.params.communityId.toString()
      let community = Community.load(communityId)
      if (community) {
        let memberAddresses = community.memberAddresses
        if (memberAddresses == null) {
          memberAddresses = []
        }
        memberAddresses.push(event.params.user)
        community.memberAddresses = memberAddresses
        community.save()
      }
    }

    pendingMember.save()
  }
}