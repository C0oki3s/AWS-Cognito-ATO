# Cognito PR review evaluation fixture

This directory adds an isolated Express and Mongoose code corpus for evaluating the repository's pull request review flow. It uses the existing project stack and authentication examples as its reference. The root application does not import or mount these routers, and the fixture does not connect to AWS or start a listener.

The source uses synthetic `example.test` identities and illustrative database models. It contains intentionally unsafe request handling across identity, documents, administration, search, recovery, export, tenancy, and support routes so a code reviewer can exercise the normal PR review path over a roughly 1,000-line change.

`src/app.js` only exports a factory. It has no startup side effect. Do not wire this fixture into the root `index.js` or deploy it. Review it as a static evaluation change.

The fixture has 1,053 JavaScript source lines by `wc -l` (995 nonblank lines). It does not add dependencies, secrets, or changes to the existing application.
