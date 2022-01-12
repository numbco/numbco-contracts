const keccak256 = require("keccak256")
const { MerkleTree } = require("merkletreejs")
const { ethers } = require("ethers")

const getAddressTreeRoot = (addresses) => {
  const leafNodes = addresses.map((address) => keccak256(address))
  const tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
  const root = tree.getHexRoot()
  return { root, tree }
}

const getAddressAllowanceHash = (address, allowance) => {
  return Buffer.from(ethers.utils.solidityKeccak256(["address", "string"], [address, allowance]).slice(2), "hex")
}

const getAllocationsTreeRoot = (addressAllocations) => {
  const leafNodes = Object.entries(addressAllocations).map((aa) => getAddressAllowanceHash(...aa))
  const tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
  const root = tree.getHexRoot()
  return { root, tree }
}

module.exports.getAddressTreeRoot = getAddressTreeRoot
module.exports.getAddressAllowanceHash = getAddressAllowanceHash
module.exports.getAllocationsTreeRoot = getAllocationsTreeRoot
