// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AttestationRegistry
 * @notice On-chain registry of attestations for Epistimology audit items.
 * Each address may attest a given item at most once; repeats revert.
 * Item IDs are the app's UUIDs packed into bytes16 (dashes stripped).
 */
contract AttestationRegistry is Ownable {
    mapping(bytes16 => uint256) private _counts;
    mapping(bytes16 => mapping(address => bool)) private _attested;
    mapping(bytes16 => mapping(address => bytes32)) private _signatureHashes;
    mapping(bytes16 => mapping(address => bool)) private _hasSignature;

    event Attested(bytes16 indexed itemId, address indexed attester);
    event SignatureRecorded(
        bytes16 indexed itemId,
        address indexed attester,
        bytes32 contentHash,
        bytes signature
    );

    error AlreadyAttested(bytes16 itemId, address attester);
    error AlreadyRecorded(bytes16 itemId, address attester);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Record the caller's attestation for `itemId`.
     * Reverts with `AlreadyAttested` when the caller already attested it.
     */
    function attest(bytes16 itemId) external {
        if (_attested[itemId][msg.sender]) {
            revert AlreadyAttested(itemId, msg.sender);
        }
        _attested[itemId][msg.sender] = true;
        unchecked {
            _counts[itemId] += 1;
        }
        emit Attested(itemId, msg.sender);
    }

    /** @notice Number of attestations recorded for `itemId`. */
    function attestationCount(bytes16 itemId) external view returns (uint256) {
        return _counts[itemId];
    }

    /** @notice Whether `account` already attested `itemId`. */
    function hasAttested(bytes16 itemId, address account) external view returns (bool) {
        return _attested[itemId][account];
    }

    /**
     * @notice Record the caller's creation signature for `itemId`.
     * Stores the content hash on-chain and emits the full signature.
     * Reverts with `AlreadyRecorded` when the caller already recorded one.
     */
    function recordSignature(
        bytes16 itemId,
        bytes32 contentHash,
        bytes calldata signature
    ) external {
        if (_hasSignature[itemId][msg.sender]) {
            revert AlreadyRecorded(itemId, msg.sender);
        }
        _hasSignature[itemId][msg.sender] = true;
        _signatureHashes[itemId][msg.sender] = contentHash;
        emit SignatureRecorded(itemId, msg.sender, contentHash, signature);
    }

    /** @notice Content hash recorded by `account` for `itemId`, if any. */
    function signatureContentHash(
        bytes16 itemId,
        address account
    ) external view returns (bytes32) {
        return _signatureHashes[itemId][account];
    }

    /** @notice Whether `account` already recorded a signature for `itemId`. */
    function hasRecordedSignature(
        bytes16 itemId,
        address account
    ) external view returns (bool) {
        return _hasSignature[itemId][account];
    }
}
