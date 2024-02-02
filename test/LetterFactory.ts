import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { assert, expect } from "chai";
import hre from "hardhat";
import { getAddress, parseGwei } from "viem";

// A deployment function to set up the initial state
const deploy = async () => {
  const myLetters = await hre.viem.deployContract("LetterOwnership");

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
});
