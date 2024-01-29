//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "./LetterFactory.sol";

contract LetterOwnership is LetterFactory {

  event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
  event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

  mapping (uint => address) letterApprovals;

  function balanceOf(address _owner) external view returns (uint256) {
    return ownerLetterCount[_owner];
  }

  function ownerOf(uint256 _tokenId) external view returns (address) {
    return letterToOwner[_tokenId];
  }

  function _transfer(address _from, address _to, uint256 _tokenId) private {
    ownerLetterCount[_to] = ownerLetterCount[_to] + 1;
    ownerLetterCount[msg.sender] = ownerLetterCount[msg.sender] - 1;
    letterToOwner[_tokenId] = _to;
    emit Transfer(_from, _to, _tokenId);
  }

  function transferFrom(address _from, address _to, uint256 _tokenId) external payable {
    require (letterToOwner[_tokenId] == msg.sender || letterApprovals[_tokenId] == msg.sender);
    _transfer(_from, _to, _tokenId);
    if (letterApprovals[_tokenId] == msg.sender) {
      delete(letterApprovals[_tokenId]);
    }
  }

  function approve(address _approved, uint256 _tokenId) external payable onlyOwnerOf(_tokenId) {
    letterApprovals[_tokenId] = _approved;
    emit Approval(msg.sender, _approved, _tokenId);
  }

  function getLettersByOwner(address _owner) external view returns(uint[] memory) {
    uint[] memory result = new uint[](ownerLetterCount[_owner]);
    uint counter = 0;
    for (uint i = 0; i < letters.length; i++) {
      if (letterToOwner[i] == _owner) {
        result[counter] = i;
        counter++;
      }
    }
    return result;
  }
}
