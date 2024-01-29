//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LetterFactory is Ownable {

  event NewLetter(string content);

  struct Letter {
    string content;
  }

  Letter[] public letters;

  mapping (uint => address) public letterToOwner;
  mapping (address => uint) ownerLetterCount;

  modifier onlyOwnerOf(uint _letterId) {
    require(msg.sender == letterToOwner[_letterId]);
    _;
  }

  constructor() Ownable(msg.sender) {}

  function createLetter(string memory _content) public {
    letters.push(Letter(_content));
    uint id = letters.length - 1;
    letterToOwner[id] = msg.sender;
    ownerLetterCount[msg.sender] = ownerLetterCount[msg.sender] + 1;
    emit NewLetter(_content);
  }
}
