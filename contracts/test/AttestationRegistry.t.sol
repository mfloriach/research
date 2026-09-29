// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AttestationRegistry} from "../src/AttestationRegistry.sol";

contract AttestationRegistryTest is Test {
    AttestationRegistry private registry;
    address private alice = makeAddr("alice");
    address private bob = makeAddr("bob");
    bytes16 private constant ITEM = bytes16(uint128(0x1234));

    function setUp() public {
        registry = new AttestationRegistry(address(this));
    }

    function test_attest_increments_count() public {
        vm.prank(alice);
        registry.attest(ITEM);
        assertEq(registry.attestationCount(ITEM), 1);
        assertTrue(registry.hasAttested(ITEM, alice));
        assertFalse(registry.hasAttested(ITEM, bob));
    }

    function test_double_attest_reverts() public {
        vm.prank(alice);
        registry.attest(ITEM);
        vm.expectRevert(
            abi.encodeWithSelector(
                AttestationRegistry.AlreadyAttested.selector,
                ITEM,
                alice
            )
        );
        vm.prank(alice);
        registry.attest(ITEM);
        assertEq(registry.attestationCount(ITEM), 1);
    }

    function test_distinct_items_are_independent() public {
        bytes16 other = bytes16(uint128(0x5678));
        vm.prank(alice);
        registry.attest(ITEM);
        vm.prank(alice);
        registry.attest(other);
        assertEq(registry.attestationCount(ITEM), 1);
        assertEq(registry.attestationCount(other), 1);
    }

    function test_two_attesters_count_twice() public {
        vm.prank(alice);
        registry.attest(ITEM);
        vm.prank(bob);
        registry.attest(ITEM);
        assertEq(registry.attestationCount(ITEM), 2);
    }

    function test_emits_attested_event() public {
        vm.expectEmit(true, true, false, false);
        emit AttestationRegistry.Attested(ITEM, alice);
        vm.prank(alice);
        registry.attest(ITEM);
    }

    function test_unknown_item_has_zero_count() public view {
        assertEq(registry.attestationCount(bytes16(uint128(0x9999))), 0);
    }
}
