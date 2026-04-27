// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SSI {

    // 👤 Identity storage
    mapping(address => string) public identities;

    // 📜 Credential structure
    struct Credential {
        string data;        // CID or credential data
        address issuer;     // who issued
        bytes signature;    // digital signature
    }

    // 📂 Store multiple credentials per user
    mapping(address => Credential[]) public credentials;

    // 👑 Issuer (admin)
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // 🔒 Only issuer modifier
    modifier onlyIssuer() {
        require(msg.sender == owner, "Not authorized issuer");
        _;
    }

    // 🆔 Create / Update Identity
    function createOrUpdateIdentity(string memory _did) public {
        require(bytes(_did).length > 0, "DID cannot be empty");

        identities[msg.sender] = _did;

        emit IdentityUpdated(msg.sender, _did);
    }

    // 🔍 Get Identity
    function getIdentity(address user) public view returns (string memory) {
        return identities[user];
    }

    // 🏫 Issue Credential (ONLY ISSUER)
    function issueCredential(
        address user,
        string memory data,
        bytes memory sig
    ) public onlyIssuer {

        require(bytes(data).length > 0, "Invalid data");

        credentials[user].push(
            Credential(data, msg.sender, sig)
        );

        emit CredentialIssued(user, data);
    }

    // 📄 Get Credentials
    function getCredentials(address user)
        public
        view
        returns (Credential[] memory)
    {
        return credentials[user];
    }

    // 📢 EVENTS (VERY IMPORTANT FOR PROJECT)
    event IdentityUpdated(address indexed user, string did);
    event CredentialIssued(address indexed user, string data);
}