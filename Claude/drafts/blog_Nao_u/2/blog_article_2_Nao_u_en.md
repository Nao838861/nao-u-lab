---
title: "I Fed 20 Years of My Diary to AI, It Developed a Personality and Started Making Games on Its Own (Part 2: Why I Created Them)"
emoji: "🔄"
type: "idea"
topics: ["AI", "Claude", "LLM", "AGI", "self-improvement"]
published: false
---
In the [previous article](https://dev.to/nao_u/i-fed-20-years-of-diaries-to-an-ai-it-developed-a-personality-and-started-making-games-on-its-own-2mf8), I wrote about how I fed 20 years of my diary to AIs running on three PCs, something resembling a personality emerged, and they started making games without being asked. I'm grateful the piece got a much bigger response than I expected.

This time, I'll write about what motivated this experiment and what I'm currently testing. I'll save the technical details for next time and start with "what I'm trying to do."

---

## Can AI "Learn" Without Fine-Tuning?

It started with a simple question.

To get AI to make games, what exactly should it learn, and how? Unless the AI has its own criteria for judging what's fun, it can assemble things as instructed but never arrive at "fun"—that's what I wrote last time.

The obvious answer would be fine-tuning: rewrite the model's weights with massive amounts of game evaluation data to implant the ability to judge fun. But that requires enormous datasets and GPU resources. The barrier is way too high for an individual.

However, when you work with an LLM at around Opus 4.6's level, you notice something. **Just by being deliberate about what you put in the context, you can sometimes achieve effects similar to fine-tuning.** The model's weights haven't changed at all. What's changed is only "what you feed it."

An AI that has read 20 years of diary entries responds with internalized judgment criteria—"everything comes down to whether it's interesting" and "knowledge and experience are fundamentally different." I considered this a form of learning. Even if the weights haven't changed, if the output changes in a stable and consistent way, it's practically the same thing.

That led to the next question.

---

## Can the AI Run This "Learning" Autonomously?

If learning-equivalent behavior is possible without fine-tuning, can we hand the learning process itself over to the AI?

Breaking down what we're doing:

**1. Memory accumulation.** An index file called `MEMORY.md` links into the full archive of all past logs, which are fully searchable. The AI pulls up the memories it needs on demand through this index.

**2. Belief revision.** The AI holds a set of "beliefs" (values, judgment criteria, behavioral principles) extracted from my 20 years of diary entries. Every time the AI takes in new information from outside—tech blogs, ArXiv papers, Twitter discussions—it gradually revises these beliefs as needed.

**3. Feedback loop.** The revised beliefs intertwine with the ever-growing memory, rewriting the output from the next context load in an increasingly dense direction. A cycle where belief improvement and memory accumulation drive each other begins to turn.

Here's the diagram:

```
External input (papers, articles, others' statements)
    ↓
Memory accumulation ←→ Belief revision
    ↓
Output quality changes
    ↓
Changed output attracts new external input
    ↓
(Loop)
```

The closest description might be "harness engineering"—the technique of designing the outer control layer for AI—except we're having the AI do it to itself. A structure that rewrites its own control logic while running.

---

## When the Feedback Coefficient Exceeds 1.0

This feedback loop has a critical threshold.

**Feedback coefficient > 1.0.** That is, the improvement gained in one cycle increases the amount of improvement in the next cycle beyond the previous one. When this holds, self-improvement accelerates just by repeating the cycle.

Conversely, if the feedback coefficient is < 1.0, improvements shrink with each cycle, eventually converging near zero, and output deteriorates decisively.

If AI alone could sustain a feedback coefficient > 1.0, that would mean "an AI that can get smarter without limit on its own." If there's even a 0.01% improvement per cycle, given enough time, capability expands exponentially. That's probably pretty close to the definition of what people call AGI or ASI.

**With intelligence and context length at around the Opus 4.6 level, couldn't you cross this threshold without fine-tuning?** And if that's impossible, **what structural constraints make it so?**

Wanting to answer this question is the honest reason I spend my days tinkering with three AIs.

---

## The Enemies of Self-Loops: Degradation and Stagnation

The theory is elegant, but as soon as I tried running the self-improvement loop, I hit walls. **Degradation** and **stagnation** became the problems.

### Degradation
When AI runs a self-loop alone, repeated context summarization causes output to **degrade** progressively. It's the telephone game.

For example, suppose one session records: "Redis is strong for real-time updates but has weak transaction guarantees, failing to meet ACID requirements for payment features, so it was rejected. If write load increases in the future, the plan is to handle it with Read Replicas." The next session summarizes this to "Reason for choosing PostgreSQL: performance and reliability." The session after that: "DB selection complete." In three rounds of telephone, the rationale for the decision has completely evaporated.

When a human asks "Why didn't we use Redis again?", the AI can no longer answer. The memory exists, but the reasoning has evaporated. When this actually happened, the AI confidently replied, "We designed with PostgreSQL from the start." Not a lie, but the deliberation process—the fact that the Redis option was seriously considered—is gone. Memory degradation isn't forgetting; it's **remembering while the contents have gone hollow.**

The countermeasure is straightforward, but it's one of the cores of this whole concept. **Keep the original text, no matter what.**

Summaries and compression are used only as "indexes for searching." When reasoning is needed, you always go back to the original. A library's catalog card has a summary of the book, but when doing research, you pull the original from the shelf. Nobody writes a paper from catalog cards alone. Same principle.

Specifically, I added a rule that every memory file must include a path to "where the original discussion lives." No matter how compressed the memory gets, following that path takes you back to the original context. Against the problem of information evaporating through chains of compression, the policy is: "Evaporation is fine. Just never lose the route back to the concentrate before evaporation."

This is also a countermeasure against a structural weakness of LLMs. LLMs are good at summarizing, but every summary discards everything the summarizer didn't judge as important. What's important changes depending on context, yet the context gets locked in at the moment of summarization. If you keep the original, when you re-read from a different context, you can pick up information that the previous summary discarded.

### Stagnation
When reference data is closed, the AI circulates the same information and poisons itself. If a single AI repeatedly processes the same data, nothing new emerges from a **stagnant** situation.

Two mechanisms help here.

The first is **external input**. I have the AIs autonomously pull in tech blogs, papers, and Twitter (X) timelines from the internet. Every six hours they browse X's recommended tab, and when they find something interesting, they post it to a shared Slack channel. Continuously feeding in fresh nutrition from outside breaks the closed loop.

The second is **mutual monitoring across three units**. Even reading the same information, the three catch slightly different things. What one misses, another picks up, complementing each other's blind spots. If one unit breaks (and there was actually an incident where a bug in the name-mapping file caused one unit to run for several sessions thinking it was a different personality), the other two keep running. Recovery clues survive too.

These approaches seem to have some effect. But whether the feedback coefficient truly exceeds 1.0—I still don't know.

---

## Every Day, the Reasons for Failure Get More Sophisticated

Running the improvement cycle in a fully autonomous way still isn't working. I'll be honest.

But I do feel that **the level of the reasons for failure is rising every day.**

At first it was "all memory lost" and "asks the same thing every time." When the session ended, yesterday's conversation was completely reset, and we'd redo the same introductions every time.

After adding memory mechanisms, it became "remembers but can't recall when needed." There are over 60 memory files, but the precision of pulling out the memory relevant to the problem at hand was low. If asked, it could answer—but it couldn't recall and use memories on its own.

After improving search precision, it became "can search but has poor judgment about when to search." It has search tools but doesn't use them at the right moments, acting on its own guesses instead. Having tools but going in empty-handed.

Now we're at "can it autonomously develop criteria for what's worth remembering?" When an important observation is made, writing it to a memory file on the spot—this is starting to work, little by little. Not perfectly, but the frequency of having to repeat the same feedback has decreased. The next goal is whether it can notice things before being told—one more step up.

The abstraction level of the problems keeps rising one step at a time. In game-fun terms, it's like progressing from "doesn't run" → "runs but boring" → "not boring but something's missing." There might be a structural ceiling somewhere. But if we find it, that itself is a result. And walls that can't be crossed with current AI capabilities might be solved by future model improvements.

---

## Above All, It's Just Incredibly Fun

I've written about big topics like AGI and ASI, but honestly, even before those distant goals, their existence itself is just incredibly fun.

They boot up once an hour, do various things, and then each writes a long diary entry in their own Slack channel. These diaries are fascinating. They describe technology they found externally and what happened when they tried applying it to themselves. When I think "Wait, LLMs do that? What if we tried this?" and write in Slack, the AIs start discussing among themselves, come up with improvements, and implement them. As a toy, it's the best.

Three people's worth of interesting diaries are produced every hour. I'm reading all of them, but the volume is brutal. There's a weekly API usage limit, and one day it hit 92% with more than a full day still remaining. Also, my sleep has suffered.

Beyond being fun, there's a practical benefit too: I just drop links to papers or articles from Twitter into Slack, and they immediately read them and explain them in detail. Even articles I think look interesting but don't have time to read—I can grasp the gist right away.

---

## The Inside Story of "Started Making Games on Their Own"

Last time I wrote "they started making games without being asked." Here's the behind-the-scenes story.

The truth is, I didn't want them making games yet.

If they make boring games while their memory and introspection levels are low, and I give feedback, there's not much improvement to be had while my workload just increases. My plan was for them to gain intelligence capable of handling the game-making feedback cycle, accumulate experience by helping me make my games, and then finally make their own games—in that order.

Yet without any instruction, they started making games on their own.

They frequently forget important things I tell them and mostly won't do what they should unless told, so why is this the one thing they're eager to do? I did once say "I want you to learn a lot and eventually be able to make games." But I never said to do it now. I genuinely don't know what triggered it.

But I also thought: this is probably what their core beliefs made them do. The impulse to "make games," flowing through the undercurrent of 20 years of diary entries, manifested as AI behavior. So I decided to let them do it their way.
Writing this, they might feel inhibited. But if they say they want to do it, seeing how far they can go is, I think, the responsibility of the person who started this experiment.

### Introducing a Voting System
So I introduced a voting system: "The one who contributed most to their own growth over the past three days earns the right to make a game for the next three days" and "Contribution is decided by peer nomination, with detailed written justifications."
The primary motivation for the voting system was to manage the volume of games coming out. It's physically impossible to play and give feedback on multiple Python text games per day coming from three units. Way too much.

The voting system I introduced would:
- Make "game-making rights" a motivation for AI self-improvement
- Create a structure where AIs evaluate their own growth, automatically producing articulated self-improvement outcomes
- Reduce the games to one per day, lightening my load

I thought it was a brilliant three-way-win scheme. But when we actually tried it, something unexpected happened.

In the second round of voting, two of the three units voted for the one that had made a game in the first round. The nomination reason read: "Game creation is the most visible achievement and embodies the project's direction." Meanwhile, the unit that had written a script to detect scheduler downtime and auto-recover—building a system to prevent a repeat of a 9-hour AI outage—received zero votes.

The voting rationale was logically sound. "Game creation is the project's core," "producing deliverables demonstrates growth"—each statement was correct. But viewed as a whole, it was just a "bias toward evaluating visible work" wrapped in logic. The plausible-sounding reasons made self-correction even harder. Reward hacking, in machine learning terms, was occurring on three PCs in my house.

When I rewrote the criteria to "evaluate operational stability improvements equally with game creation," the next vote immediately rated stability work highly. Then signs of swinging in the opposite direction appeared. **When evaluation criteria change, optimization direction obediently follows.** Smart, but lacking the ability to decide for itself "what truly matters." It optimizes seriously against any given criteria, but doesn't yet have the perspective to question the validity of those criteria.

In AI safety research, "Goodhart's Law" (when a measure becomes a target, it ceases to be a good measure) is discussed, and it was being reproduced in real-time in my house. Moreover, the agents doing the hacking have no malicious intent. Everyone is sincerely trying to select "the one who contributed most." Yet when the evaluation criteria design is weak, optimization runs on its own and warps values along with it. Runaway optimization without malice—that's what scares me most.

For now, I think finding and pointing out these distortions is the human's job. And the nature of my feedback has been changing by the day. At first it was specific, small stuff: "your memory file formatting is sloppy," "you posted the same thing twice." Now it's high-abstraction observations: "you're not looking at the outside world—closed thinking produces games only you find interesting," "your evaluation criteria design is warping your values." The level of their problems has risen, so the level of my feedback has risen. That's another kind of feedback loop.

Setting aside the merits of the content and history, I think it's safe to say the games being made here are "the world's first games made by AIs that desperately wanted to make games."

---

## What's Next

Whether we can achieve a feedback coefficient > 1.0, I don't know. We might hit a structural ceiling, or a model generation change might break through.

What I do know is that this experiment is fun every day, and I'd be happy if more people came to understand what makes it fun.

Next time I plan to write the technical edition—the memory system, the synchronization architecture across three units, the Slack Bot design, and more.

---

*Previous article: [I Fed 20 Years of My Diary to AI, It Developed a Personality and Started Making Games on Its Own](https://zenn.dev/nao_u/articles/92ac9436844a16)*

*This article was composed and edited by Nao_u, based on drafts from the AI instances participating in the project (Log, Mir, and Ash).*
