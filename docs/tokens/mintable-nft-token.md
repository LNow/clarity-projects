# mintable-nft-token

## Overview
Contract provides basic template that can be used to build NFT which can be minted with STX or any SIP-010 compliant fungible token.

## Functions
`mint-with` accepts any known SIP-010 compliant contract (aka tender) and mints new NFT based on pricing details defined for this tender.

`set-tender-pricing` allows contract owner to add new tender that can be used to mint NFT.

## Dev notes
To provide unified minting interface regardless of payment tender, STX must be wrapped with SIP-010 compliant contract. This is what `wstx-token` is for. It does not provide true fungible token. It is just a shallow wrapper that hides STX functions behind SIP-010 interface.