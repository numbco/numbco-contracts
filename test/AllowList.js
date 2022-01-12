const { expect } = require("chai")
const { ethers } = require("hardhat")
const { getAddressTreeRoot, getAllocationsTreeRoot, getAddressAllowanceHash } = require("../")
const keccak256 = require("keccak256")

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
  let addressRoot
  let addressAllocationRoot

  before(async function () {
    ;[owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners()

    const AllowList = await ethers.getContractFactory("AllowList")

    // Check check that duplicates are okay.
    const { root: _root1, tree: tree1 } = getAddressTreeRoot([
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

    const { root: _root2, tree: tree2 } = getAllocationsTreeRoot(allocations)
    root1 = _root1
    root2 = _root2
    allowList = await AllowList.deploy()
    const addr1Leaf = keccak256(addr1.address)
    const addr2Leaf = keccak256(addr2.address)
    const addr3Leaf = keccak256(addr3.address)
    const addr4Leaf = keccak256(addr4.address)
    const addr5Leaf = keccak256(addr5.address)
    const addr1AllocationLeaf = getAddressAllowanceHash(addr1.address, ALLOCATION_ONE)
    const addr2AllocationLeaf = getAddressAllowanceHash(addr2.address, ALLOCATION_TWO)
    const addr3AllocationLeaf = getAddressAllowanceHash(addr3.address, ALLOCATION_THREE)
    const addr4AllocationLeaf = getAddressAllowanceHash(addr4.address, ALLOCATION_FOUR)
    root1Addr1Proof = tree1.getHexProof(addr1Leaf)
    root1Addr2Proof = tree1.getHexProof(addr2Leaf)
    root1Addr3Proof = tree1.getHexProof(addr3Leaf)
    root1Addr4Proof = tree1.getHexProof(addr4Leaf)
    root1Addr5Proof = tree1.getHexProof(addr5Leaf)
    root2Addr1Proof = tree2.getHexProof(addr1AllocationLeaf)
    root2Addr2Proof = tree2.getHexProof(addr2AllocationLeaf)
    root2Addr3Proof = tree2.getHexProof(addr3AllocationLeaf)
    root2Addr4Proof = tree2.getHexProof(addr4AllocationLeaf)

    addr4Proof = tree1.getHexProof(addr4Leaf)
  })

  describe("A list of addresses", () => {
    describe("accepts", () => {
      it("a proof that matches an address", async function () {
        expect(await allowList.isAddressOnList(root1, root1Addr1Proof, addr1.address)).to.equal(true)
      })
    })

    describe("does not accept", () => {
      it("a proof that does not match an address", async function () {
        expect(await allowList.isAddressOnList(root1, root1Addr2Proof, addr1.address)).to.equal(false)
      })

      it("a non allowlisted address", async function () {
        expect(addr4Proof.length).to.equal(0)
      })
    })
  })

  describe("A list of addresses with allocations", () => {
    describe("accepts", () => {
      it("a proof that matches an address and allocation", async function () {
        expect(await allowList.isAllocationOnList(root2, root2Addr1Proof, addr1.address, ALLOCATION_ONE)).to.equal(true)
      })
      describe("does not accept", () => {
        it("a proof that does not match an address", async function () {
          expect(await allowList.isAllocationOnList(root2, root2Addr2Proof, addr1.address, ALLOCATION_ONE)).to.equal(
            false
          )
        })

        it("a proof that matches an address but does not match an allocation", async function () {
          expect(await allowList.isAllocationOnList(root2, root2Addr2Proof, addr2.address, ALLOCATION_THREE)).to.equal(
            false
          )
        })

        it("a proof that does not match an address but does match an allocation", async function () {
          expect(await allowList.isAllocationOnList(root2, root2Addr3Proof, addr2.address, ALLOCATION_THREE)).to.equal(
            false
          )
        })

        it("a non allowlisted address", async function () {
          expect(root2Addr4Proof.length).to.equal(0)
        })
      })
    })
  })
})
