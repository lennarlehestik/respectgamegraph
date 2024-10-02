import {
    PropCreated as PropCreatedEvent,
    ProposalSigned as ProposalSignedEvent,
    ProposalExecuted as ProposalExecutedEvent
  } from "../generated/Contract5/Contract5"
  import {
    Proposal,
    ProposalCreated,
    ProposalSigned,
    Community
  } from "../generated/schema"
  import { BigInt } from "@graphprotocol/graph-ts"
  import { log } from '@graphprotocol/graph-ts'

  export function handlePropCreated(event: PropCreatedEvent): void {
    let proposalId = event.params.proposalId.toString()
    let communityId = event.params.communityId.toString()
    let proposal = new Proposal(proposalId)
    
    proposal.communityId = event.params.communityId
    proposal.proposalId = event.params.proposalId
    proposal.proposalType = event.params.Type
    proposal.creator = event.params.user
    proposal.amount = event.params.amount
    proposal.approvers = []
    proposal.approvalCount = 0
    proposal.community = communityId
    proposal.createdAt = event.block.timestamp
    proposal.updatedAt = event.block.timestamp
    proposal.save()
  
    let proposalCreatedEvent = new ProposalCreated(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    proposalCreatedEvent.communityId = event.params.communityId
    proposalCreatedEvent.proposalId = event.params.proposalId
    proposalCreatedEvent.proposalType = event.params.Type
    proposalCreatedEvent.creator = event.params.user
    proposalCreatedEvent.amount = event.params.amount
    proposalCreatedEvent.blockNumber = event.block.number
    proposalCreatedEvent.blockTimestamp = event.block.timestamp
    proposalCreatedEvent.transactionHash = event.transaction.hash
    proposalCreatedEvent.save()
  }
  
  export function handleProposalSigned(event: ProposalSignedEvent): void {
    log.info('handleProposalSigned called for proposal {}', [event.params.proposalId.toString()])
  
    let proposalId = event.params.proposalId.toString()
    log.info('Attempting to load proposal with ID: {}', [proposalId])
  
    let proposal = Proposal.load(proposalId)
    
    if (proposal) {
      log.info('Proposal found. Current approvalCount: {}', [proposal.approvalCount.toString()])
  
      let approvers = proposal.approvers
      let signerAddress = event.params.signer
      log.info('Signer address: {}', [signerAddress.toHexString()])
  
      if (!approvers.includes(signerAddress)) {
        log.info('New signer. Adding to approvers list.', [])
        approvers.push(signerAddress)
        proposal.approvers = approvers
        proposal.approvalCount += 1
        proposal.updatedAt = event.block.timestamp
        log.info('Updated approvalCount: {}', [proposal.approvalCount.toString()])
  
        log.info('Saving updated proposal', [])
        proposal.save()
      } else {
        log.info('Signer already in approvers list. No changes made.', [])
      }
    } else {
      log.error('Proposal not found for ID: {}', [proposalId])
    }
  
    log.info('Creating ProposalSigned event', [])
    let proposalSignedEvent = new ProposalSigned(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    proposalSignedEvent.proposalId = event.params.proposalId
    proposalSignedEvent.signer = event.params.signer
    proposalSignedEvent.blockNumber = event.block.number
    proposalSignedEvent.blockTimestamp = event.block.timestamp
    proposalSignedEvent.transactionHash = event.transaction.hash
  
    log.info('Saving ProposalSigned event', [])
    proposalSignedEvent.save()
  
    log.info('handleProposalSigned completed', [])
  }
  
  // We're ignoring ProposalExecuted as per your instructions
  export function handleProposalExecuted(event: ProposalExecutedEvent): void {
    // This function is intentionally left empty
  }