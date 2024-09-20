**Overview**

schema.graphql: Defines the data model for the subgraph using GraphQL. Entities represent the data structure to store and query.

subgraph.yaml: The configuration file that specifies network details, smart contract sources, and event handlers. It links blockchain events to the TypeScript mapping logic.

src/Contract[#].ts: Contains the TypeScript (AssemblyScript) logic that processes smart contract events and stores data as per the schema. Each event handler updates the entity store.

**Deployment**

https://thegraph.com/docs/en/quick-start/
