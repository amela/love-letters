import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { assert, expect } from "chai";
import hre from "hardhat";
import { getAddress, parseGwei, getContract } from "viem";

// A deployment function to set up the initial state
const deploy = async () => {
  const myLetters = await hre.viem.deployContract("LetterOwnership",[]);

  return { myLetters };
};

describe("MyLetters Contract Tests", function () {
  it("should create a letter", async function () {
    // Load the contract instance using the deployment function
    const { myLetters } = await loadFixture(deploy);

    // Create a letter
    await myLetters.write.createLetter(["My first letter"]);

    const myLetter = await myLetters.read.letters([BigInt(0)]);

    // Test if letter was created
    assert.equal(myLetter, "My first letter");
  });

  it("should return a balance of letter creator", async function () {
    // Load the contract instance using the deployment function
    const { myLetters } = await loadFixture(deploy);
    
    // Address that called myLetters
    const owner = await myLetters.read.owner();
    
    // Create a letter
    await myLetters.write.createLetter(["My first letter"]);
    
    // Get balance
    const myBalance = await myLetters.read.balanceOf([owner]);

    // console.log(
    //   `User balance after created letter: ${myBalance}`
    // );

    // Test if letter was created
    assert.equal(myBalance, BigInt(1));
  });

  it("should return an owner of letter creator", async function () {
    // Load the contract instance using the deployment function
    const { myLetters } = await loadFixture(deploy);
    
    // Address that called myLetters
    const owner = await myLetters.read.owner();
    
    // Create a letter
    await myLetters.write.createLetter(["My first letter"]);
    
    // Get owner
    const myOwner = await myLetters.read.ownerOf([BigInt(0)]);

    // Test if owner is the same address function returned
    assert.equal(getAddress(myOwner), getAddress(owner));
  });

  it("should transfer a letter to another account", async function () {
    // Load the contract instance using the deployment function
    const { myLetters } = await loadFixture(deploy);

    const [aliceWalletClient, bobWalletClient] =
    await hre.viem.getWalletClients();
    
    const owner = await myLetters.read.owner();

    // Test if owner is now Alice
    assert.equal(getAddress(owner), getAddress(aliceWalletClient.account.address));
    
    // Create a letter
    await myLetters.write.createLetter(["My first letter"]);
    
    // Transfer letter
    await myLetters.write.transferFrom([aliceWalletClient.account.address, bobWalletClient.account.address, BigInt(0)]);

    // Get a letter's owner
    const myOwner = await myLetters.read.ownerOf([BigInt(0)]);

    // Test if owner is now Bob
    assert.equal(getAddress(myOwner), getAddress(bobWalletClient.account.address));
  });

  it("should get letters of one owner", async function () {
    // Load the contract instance using the deployment function
    const { myLetters } = await loadFixture(deploy);

    const [aliceWalletClient, bobWalletClient] =
    await hre.viem.getWalletClients();
    
    const owner = await myLetters.read.owner();

    // Test if owner is now Alice
    assert.equal(getAddress(owner), getAddress(aliceWalletClient.account.address));
    
    // Create letters
    await myLetters.write.createLetter(["Alice: My first letter"]);
    await myLetters.write.createLetter(["Alice: My second letter"]);
    await myLetters.write.createLetter(["Alice: My third letter"]);

    // Get letters by owner
    const aliceLetters = await myLetters.read.getLettersByOwner([aliceWalletClient.account.address]);

    // Test if we got Alice's letters
    assert.deepEqual(aliceLetters, [BigInt(0), BigInt(1), BigInt(2)]);
  });

  it("should get letters of two owners", async function () {
    // Load the contract instance using the deployment function
    const { myLetters } = await loadFixture(deploy);

    const owner = await myLetters.read.owner();

    const [aliceWalletClient, bobWalletClient] =
    await hre.viem.getWalletClients();
    const alice = aliceWalletClient.account.address;
    const bob = bobWalletClient.account.address;
    
    // Test if owner is now Alice
    assert.equal(getAddress(owner), getAddress(alice));
    
    // Create letters
    await myLetters.write.createLetter(["Bob: My first letter"], {account: bob});
    await myLetters.write.createLetter(["Alice: My first letter"], {account: alice});
    await myLetters.write.createLetter(["Alice: My second letter"], {account: alice});

    // Get letters by owner
    const aliceLetters = await myLetters.read.getLettersByOwner([alice]);
    const bobLetters = await myLetters.read.getLettersByOwner([bob]);

    // Test if we got Alice's letters
    assert.deepEqual(bobLetters, [BigInt(0)]);
    assert.deepEqual(aliceLetters, [BigInt(1), BigInt(2)]);
  });

  it("should approve transaction and send letter fom bob account", async function () {
    // Load the contract instance using the deployment function
    const { myLetters } = await loadFixture(deploy);

    const owner = await myLetters.read.owner();

    const [aliceWalletClient, bobWalletClient] =
    await hre.viem.getWalletClients();
    const alice = aliceWalletClient.account.address;
    const bob = bobWalletClient.account.address;
    
    // Test if owner is now Alice
    assert.equal(getAddress(owner), getAddress(alice));
    
    // Create letters
    await myLetters.write.createLetter(["Alice: My first letter"], {account: alice});
    await myLetters.write.createLetter(["Alice: My second letter"], {account: alice});

    // Approve transaction
    await myLetters.write.approve([bob, BigInt(0)], {account: alice});
    // Send letters
    await myLetters.write.transferFrom([alice, bob, BigInt(0)], {account: bob});

    // Get a letter's owner
    const letterOwner = await myLetters.read.ownerOf([BigInt(0)]);

    // Test if owner is now Bob
    assert.equal(getAddress(letterOwner), getAddress(bob));
  });
});
