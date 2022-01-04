const { expect } = require("chai")
const { ethers } = require("hardhat")
const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")

const getTreeRoot = (addresses) => {
  const leafNodes = addresses.map((address) => keccak256(address))
  const tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
  const root = tree.getHexRoot()
  return { root, tree }
}

const getHash = (address, allowance) => {
  return Buffer.from(
    ethers.utils
      .solidityKeccak256(["address", "string"], [address, allowance])
      .slice(2),
    "hex"
  )
}

const getTreeRootAllocations = (addressAllocations) => {
  const leafNodes = Object.entries(addressAllocations).map((aa) =>
    getHash(...aa)
  )
  const tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
  const root = tree.getHexRoot()
  return { root, tree }
}

describe("AllowList", function () {
  const ALLOCATION_ONE = "1"
  const ALLOCATION_TWO = "2"
  const ALLOCATION_THREE = "3"
  const ALLOCATION_FOUR = "4"
  let allowList
  let owner
  let addr1
  let addr2
  let addr3
  let addr4
  let addr5
  let addr6
  let addr7
  let root1Addr1Proof
  let root1Addr2Proof
  let root2Addr1Proof
  let root2Addr2Proof
  let root1Addr5Proof
  let addr4Proof
  let root1
  let root2

  before(async function () {
    ;[
      owner,
      addr1,
      addr2,
      addr3,
      addr4,
      addr5,
      addr6,
      addr7,
    ] = await ethers.getSigners()

    const AllowList = await ethers.getContractFactory("AllowList")
    const { root: _root1, tree: tree1 } = getTreeRoot([
      addr1.address,
      addr2.address,
      addr2.address,
      addr5.address,
      addr5.address,
      addr1.address,
      addr7.address,
    ])

    const allocations = {}
    allocations[addr1.address] = ALLOCATION_ONE
    allocations[addr2.address] = ALLOCATION_TWO
    allocations[addr3.address] = ALLOCATION_THREE
    allocations[addr4.address] = ALLOCATION_FOUR

    const { root: _root2, tree: tree2 } = getTreeRootAllocations(allocations)
    root1 = _root1
    root2 = _root2
    allowList = await AllowList.deploy()
    const addr1Leaf = keccak256(addr1.address)
    const addr2Leaf = keccak256(addr2.address)
    const addr3Leaf = keccak256(addr3.address)
    const addr4Leaf = keccak256(addr4.address)
    const addr5Leaf = keccak256(addr5.address)
    const addr1AllocationLeaf = getHash(addr1.address, ALLOCATION_ONE)
    root1Addr1Proof = tree1.getHexProof(addr1Leaf)
    root1Addr2Proof = tree1.getHexProof(addr2Leaf)
    root1Addr5Proof = tree1.getHexProof(addr5Leaf)
    root2Addr1Proof = tree2.getHexProof(addr1AllocationLeaf)
    root2Addr2Proof = tree2.getHexProof(addr2Leaf)
    addr4Proof = tree1.getHexProof(addr4Leaf)
  })

  describe("A list of addresses", () => {
    describe("Root 1 Address 1", () => {
      describe("accepts", () => {
        it("a proof that matches an address", async function () {
          expect(
            await allowList.isAddressOnList(
              root1,
              root1Addr1Proof,
              addr1.address
            )
          ).to.equal(true)
        })
      })

      describe("does not accept", () => {
        it("a proof that does not match an address", async function () {
          expect(
            await allowList.isAddressOnList(
              root1,
              root1Addr2Proof,
              addr1.address
            )
          ).to.equal(false)
        })

        it("a non white-listed address", async function () {
          expect(addr4Proof.length).to.equal(0)
        })
      })
    })

    describe("Root 1 Address 2", () => {
      describe("accepts", () => {
        it("a proof that matches an address", async function () {
          expect(
            await allowList.isAddressOnList(
              root1,
              root1Addr2Proof,
              addr2.address
            )
          ).to.equal(true)
        })
      })
    })

    describe("Root 1 Address 5", () => {
      describe("accepts", () => {
        it("a proof that matches an address", async function () {
          expect(
            await allowList.isAddressOnList(
              root1,
              root1Addr5Proof,
              addr5.address
            )
          ).to.equal(true)
        })
      })
    })
  })

  describe("A list of addresses with allocations", () => {
    describe("Root 2 Address 1", () => {
      describe("accepts", () => {
        it("a proof that matches an address and allocation", async function () {
          expect(
            await allowList.isAllocationOnList(
              root2,
              root2Addr1Proof,
              addr1.address,
              ALLOCATION_ONE
            )
          ).to.equal(true)
        })
      })
    })
  })
})
