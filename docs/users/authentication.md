---
order: 100
---

# Authentication

User authentication is built on top of [NextAuth](https://nextauth.com/), with [Sign-in-with-Ethereum (SIWE)](https://docs.login.xyz/) as an authentication mechanism. 

The flow:

1. A user must connect their web3 wallet to the Dapp. 
1. They are asked to sign a login message using their private key to prove ownership of the wallet.
1. The signature is sent to the NextAuth backend for verification.
1. Once verified, a corresponding JWT (JSON web token) is stored client-side, to be passed in with all subsequent [queries to the backend](../frontend/graphql.md). The token persists across browser sessions, until the user chooses to disconnect their wallet.

If a database record for the user doesn't yet exist then it is created during the backed verification step.
