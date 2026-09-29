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

    event Attested(bytes16 indexed itemId, address indexed attester);

    error AlreadyAttested(bytes16 itemId, address attester);

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
}
