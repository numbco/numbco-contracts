//SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract AllowList {
  function isAddressOnList(
    bytes32 merkleRoot,
    bytes32[] memory proof,
    address claimer
  ) public pure returns (bool) {
    bytes32 leaf = keccak256(abi.encodePacked(claimer));
    return MerkleProof.verify(proof, merkleRoot, leaf);
  }

  function isAllocationOnList(
    bytes32 merkleRoot,
    bytes32[] memory proof,
    address claimer,
    string memory allocation
  ) public pure returns (bool) {
    bytes32 leaf = keccak256(
      abi.encodePacked(address(claimer), string(allocation))
    );
    return MerkleProof.verify(proof, merkleRoot, leaf);
  }
}
