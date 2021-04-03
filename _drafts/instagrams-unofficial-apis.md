---
layout: post
title: I built a tool to use Instagram's unofficial APIs!
# TODO: subtitle: 
---

<!-- TODO: share-img -->
**<abbr title="Too long; didn't read">TL;DR</abbr>**:
<!-- TODO --> The tool is [Instagram Lists](https://eusebius.tech/projects/instagram-lists/);
source code [here](https://github.com/eugenius1/eugenius1.github.io/tree/master/projects/instagram-lists).

---

I started with a **problem**: I was **following too many accounts** on Instagram.
And when you consider that I have been using the platform since April 2011,
it becomes clearer that a good spring cleaning is much needed.
Also, psychologically I didn't like having a significantly higher number of accounts I following than followers.

[API](https://en.wikipedia.org/wiki/API) = Application Programming Interface

- TOC
{:toc}

## Research & why unofficial

So I started with an internet search of how I could get a list of the accounts I follow, my "followings".
In my case, I wanted this list narrowed down to the accounts that don't follow me,
in other words accounts that are not my friends'.
I also wanted to find out which accounts have been inactive for a long time.

I came across this [StackOverflow question](https://stackoverflow.com/q/32407851) from 2015,
and the accepted answer at the time pointed to Instagram's APIs.
However, since the 2018 [Facebook–Cambridge Analytica data scandal](https://en.wikipedia.org/wiki/Facebook%E2%80%93Cambridge_Analytica_data_scandal),
their official APIs became very restrictive.
Facebook, the company, owns Instagram if you were not already aware.
The data scandal involved Cambridge Analytica obtaining info about the **friends** of the users of an app that Cambridge Analytica made,
even if these friends never used the app.

As of writing this, [Instagram's official APIs](https://developers.facebook.com/docs/instagram-basic-display-api/reference)
can only provide info on the current user's media;
nothing on their followers and followings so it would be **impossible** to build a tool that solves my problem using these APIs.

Luckily, there are some more recent answers to the StackOverflow question that show the use of Instagram's **unofficial APIs** that are used by their own website.
These APIs must be called with the right authorization so must be executed from within the instagram.com browser tab after the user has logged in.
So effectively, these APIs provide a way to automate what I would otherwise do manually such as scrolling the entire list of accounts I follow.

I should note that in 2020, Instagram introduced [_Least Interacted With_](https://www.theverge.com/2020/2/6/21126641/instagram-new-feature-following-accounts-most-shown-in-feed-least-interacted)
list under _following_ list that says:

> Review accounts you've interacted with the least in the last 90 days, such as liking their posts or reacting to their stories.

I found the list partly _okay_ but overall not a great solution to my problem.
This list of 50 accounts is first and foremost **not exhaustive**.
So let's say you would have to go through it once, unfollow as you wish and then re-enter the list to see the new suggestions at the bottom (that maintain the list at 50 accounts).
Secondly, there were a number of accounts I didn't agree with them being on the list.

## Building

Armed with a will and the StackOverflow answers, I set out to build a client-side JavaScript tool to empower me to solve my problem.
My **goal** for this tool: sort the accounts I follow by when they last posted.
The tool is ready when I have solved my problem thanks to it.

### Proof of concept

I started with a manual proof of concept:

- get lists of all my followers and followings
- get relevant details about some of these accounts

### The page

Along the way, I developed [ScopedStorage](https://github.com/eugenius1/scoped-storage), a simple wrapper around [localStorage and sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) to mimic storage per web page.

### Robustness

```js
async function getLists() {
  // ...
  try {
    baseInfo = JSON.parse(document.getElementsByTagName('body')[0].innerText);
  } catch (error) {
    console.error('You may not be on the right page, normally it should be like "https://www.instagram.com/username/?__a=1"', error);
    return;
  }
  // ...
}
```

(function `limitConfigs`)

```js
let pageLimits = { withoutWaiting: 200, withWaiting: 370 };
```

abort()

## What I discovered

- Old inactive accounts with last post date as far back as 10<sup>th</sup> May 2012.
- An account with 29k followers that last posted in November 2012 ([@sakaguchiaya](https://www.instagram.com/sakaguchiaya/)).
- Accounts that started with photography then turned personal after Instagram became **mainstream**.
- Accounts that **deleted all posts**, at least one of these because they were worried about Instagram's policy change regarding ownership rights.
- Friends that **never followed me back**. Perhaps they stopped using Instagram.
- One or two "friends" that **stopped following me**.
