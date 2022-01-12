// SPDX-License-Identifier: MIT
// NumbCo Contracts v0.1.0 (AllowList.sol)

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @dev Contract module which provides an allow list mechanism using Merkle
 * Trees for gas efficient storage.
 *
 * This module is used through inheritance. It will make available two
 * functions. `isAddressOnList` can be used to check if an address is on an
 * allow list. `isAllocationOnList` can be used to check if an address and
 * allocation are on an allow list.
 *
 * The inheriting contract should be deployed with a single state value of the
 * calculated Merkle Tree Root derived from all addresses or addresses
 * and allocations on the allow list.
 *
 * See ./test/AllowList.js to see how proofs are generated.
 *
 * Note that proofs are not generated the same for each included function.
 */
contract AllowList {
  /// @notice Check if an address is on an allow list
  /// @param merkleRoot the Merkle Root all proofs are verified against
  /// @param proof the proof generated from the account and Merkle Tree
  /// @param account the address on the allow list
  /// @return true if the address is on the allow list. False if it is not
  function isAddressOnList(
    bytes32 merkleRoot,
    bytes32[] memory proof,
    address account
  ) public pure returns (bool) {
    bytes32 leaf = keccak256(abi.encodePacked(account));
    return MerkleProof.verify(proof, merkleRoot, leaf);
  }

  /// @notice Check if an address and token allocation is on an allow list
  /// @param merkleRoot the Merkle Root all proofs are verified against
  /// @param proof the proof generated from the account and Merkle Tree
  /// @param account the address on the allow list
  /// @param allocation the address on the allow list
  /// @return true if the address and allocation is on the allow list. False if it they are not
  function isAllocationOnList(
    bytes32 merkleRoot,
    bytes32[] memory proof,
    address account,
    string memory allocation
  ) public pure returns (bool) {
    bytes32 leaf = keccak256(abi.encodePacked(address(account), string(allocation)));
    return MerkleProof.verify(proof, merkleRoot, leaf);
  }
}
