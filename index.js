const keccak256 = require("keccak256")
const { MerkleTree } = require("merkletreejs")

const addressAllocations = {
  "0x051e5bb1e177b639b45536902310112679c346b3": "1",
  "0x1545853fe2e5e1946362422d1d8ba7a940e4e58c": "2",
  "0x1e1da7aca1bd692923e68a1bf24fc7cb94e444b9": "4",
}

const getTreeRoot = (addressAllocations) => {
  const leafNodes = Object.entries(addressAllocations).map((aa) =>
    keccak256(`${aa[0]}${aa[1]}`)
  )
  const tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
  const root = tree.getHexRoot()
  return { root, tree }
}

const { root: root, tree: tree } = getTreeRoot(addressAllocations)

const getAddressAllocationLeaf = (address, allowance) => {
  return keccak256(`${address}${allowance}`)
}

const address1Leaf = getAddressAllocationLeaf(
  "0x051e5bb1e177b639b45536902310112679c346b3",
  "1"
)
const address1Proof = tree.getHexProof(address1Leaf)

console.log("address1Proof", address1Proof)

console.log("root", root)
