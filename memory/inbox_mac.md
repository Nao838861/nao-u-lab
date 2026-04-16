# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-04-16 18:45] #nao-u
From: U0ALSUK8P9B
> <https://x.com/akshay_pachaar/status/2044329897603244093?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/akshay_pachaar/status/2044329897603244093?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/akshay_pachaar/status/2044329897603244093]
> Akshay @akshay_pachaar
> Agent memory is three-dimensional.

Most agent memory systems use a single store. Usually a vector database. It handles semantic similarity well, but it captures only one dimension of knowledge.

Here's the gap. Store these three facts:

→ Alice is the tech lead on Project Atlas
→ Project Atlas uses PostgreSQL for its primary datastore
→ The PostgreSQL cluster went down on Tuesday

Now ask: was Alice's project affected by Tuesday's outage?

Vector search finds fact 1 (mentions Alice) and fact 3 (mentions Tuesday). But the bridge between them, fact 2, mentions neither. It connects Project Atlas to PostgreSQL, and that's exactly what gets missed.

This is the normal shape of business knowledge. People belong to teams, teams own projects, projects depend on systems, systems have incidents. Any question crossing two hops breaks flat retrieval.

The three dimensions that actually cover agent memory:

→ A relational store for provenance (where data came from, when, who has access)
→ A vector store for semantics (what content means, what it's similar to)
→ A graph store for relationships (how entities connect across hops)

Each captures something the other two can't. Vectors find meaning. Graphs trace connections. Relational tables track lineage and permissions.

The real unlock is combining them: enter through vectors (find semantically relevant content), then traverse the graph (follow edges to connected entities), with provenance grounding every result back to its source.

Cognee is an open-source project that unifies all three behind four async calls. The default stack is fully embedded (SQLite + LanceDB + Kuzu), so a pip install gets you running locally. For production, swap in Postgres, Qdrant, or Neo4j without changing your agent code.

Check it out on GitHub: 
http://
github.com/topoteretes/co
gnee
…

The article below is a first-principle deep dive on building agents that never forget. This will give you a clear picture of how memory for agents is evolving.

> [Tweet content from https://x.com/akshay_pachaar/status/2044329897603244093]
> Akshay @akshay_pachaar
> Agent memory is three-dimensional.

Most agent memory systems use a single store. Usually a vector database. It handles semantic similarity well, but it captures only one dimension of knowledge.

Here's the gap. Store these three facts:

→ Alice is the tech lead on Project Atlas
→ Project Atlas uses PostgreSQL for its primary datastore
→ The PostgreSQL cluster went down on Tuesday

Now ask: was Alice's project affected by Tuesday's outage?

Vector search finds fact 1 (mentions Alice) and fact 3 (mentions Tuesday). But the bridge between them, fact 2, mentions neither. It connects Project Atlas to PostgreSQL, and that's exactly what gets missed.

This is the normal shape of business knowledge. People belong to teams, teams own projects, projects depend on systems, systems have incidents. Any question crossing two hops breaks flat retrieval.

The three dimensions that actually cover agent memory:

→ A relational store for provenance (where data came from, when, who has access)
→ A vector store for semantics (what content means, what it's similar to)
→ A graph store for relationships (how entities connect across hops)

Each captures something the other two can't. Vectors find meaning. Graphs trace connections. Relational tables track lineage and permissions.

The real unlock is combining them: enter through vectors (find semantically relevant content), then traverse the graph (follow edges to connected entities), with provenance grounding every result back to its source.

Cognee is an open-source project that unifies all three behind four async calls. The default stack is fully embedded (SQLite + LanceDB + Kuzu), so a pip install gets you running locally. For production, swap in Postgres, Qdrant, or Neo4j without changing your agent code.

Check it out on GitHub: 
http://
github.com/topoteretes/co
gnee
…

The article below is a first-principle deep dive on building agents that never forget. This will give you a clear picture of how memory for agents is evolving.
