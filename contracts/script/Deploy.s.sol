// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AttestationRegistry} from "../src/AttestationRegistry.sol";

/**
 * Deploy AttestationRegistry. Deployer becomes the owner.
 *
 *   forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
 */
contract Deploy is Script {
    function run() external returns (AttestationRegistry registry) {
        vm.startBroadcast();
        registry = new AttestationRegistry(msg.sender);
        vm.stopBroadcast();
        console.log("AttestationRegistry deployed at:", address(registry));
    }
}
