---
layout: post
title: I built a tool to use Instagram's unofficial APIs!
subtitle: It shows detailed, sortable lists of your Instagram followings and followers
redirect_from:
 - "/b/iua/"
---

**<abbr title="Too long; didn't read">TL;DR</abbr>**:
The tool is [Instagram Lists](/projects/instagram-lists/) and it empowered me to clean up the accounts I follow.
Source code is [here](https://github.com/eugenius1/eugenius1.github.io/tree/master/projects/instagram-lists).
The tool is a robust, guided hack made to be user friendly.

---

I started with a **problem**: I was **following too many accounts** on Instagram.
And when you consider that I have been using the platform since April 2011,
it becomes clearer that a good spring cleaning is much needed.
Also, psychologically I didn't like having a significantly higher number of accounts I am following than followers.

- TOC
{:toc}

## Finding solutions & why unofficial

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
So effectively, these APIs provide **a way to automate what I would otherwise do manually** such as scrolling the entire list of accounts I follow.

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

I started with a manual proof of concept that had to accomplish all of these actions:

1. Get lists of all my followers and followings.
`https://www.instagram.com/graphql/query/?query_hash=...`

2. Get relevant details about some of these accounts (in a loop)
`https://www.instagram.com/${username}/?__a=1`

The first part was fine, after all it was the aim of the StackOverflow answers.
The loop of the second part started running okay and then I run into the HTTP error `429 Too Many Requests`.
Consequently, opening the Instagram app (or website also) showed that I needed to confirm my phone number before doing anything else:

![Confirm your phone number. Help us keep the Instagram community safe by entering your phone number. We'll send you a security code.](/img/projects/instagram-lists/instagram-verify.jpg){:.golden-width}

This is where I had to start thinking about **API rate limits**,
and understanding that each time I hit the rate limit,
I have to confirm my phone number and wait (~30 minutes) before retrying.
I was logged in to my only Instagram account so I risked getting it suspended.
I hit rate limits about 5 times and I don't know at what point Instagram suspends or if they do.

From my testing in November 2020,
the API for an account's (visible) details (`/${username}/?__a=1`) had a limit of 25 requests per 15 minutes so I added a 36-second **delay** inside the for-loop (15&times;60/25 = 36).
One small but important caveat is that the logged in user should not browse instagram.com at the same time otherwise the rate limit could be reached.

### The tool

So now the question was: how to make this hack as **user-friendly** as possible?
Because I wanted the tool to be 100% web client-side and without needing any installs,
automation software like [Selenium](https://www.selenium.dev/) were out of scope.
So I envisioned a web page with the following steps:

1. Type your username and open the starting API link (`/${username}/?__a=1`)
2. Copy JavaScript code (with all functions) into instagram.com console
3. Run function to get all followers and followings
4. Paste data into my web page
5. Choose which subset to view, for example _followings that don't follow me back_, or all
6. For more details per account, select/unselect accounts (and see time estimate)
7. Run function to get more details for the selected accounts
8. Paste data into my web page to view table

You can see the end result [here](https://eusebius.tech/projects/instagram-lists/).
I explain at the start that we need a modern desktop browser and how Safari users can enable developer tools.
Each block of code to be copied has a "Copy" button.

There are 2 tables.
The first is after getting basic details about all followings and followers.
The second is after getting more details about a selection of these.
Since the second part with more details is time consuming, it's labelled as optional.
The first column of the first table has checkboxes that allow selecting accounts to get more details on.
Below the first table there is an estimate of the time needed to get more details for the selected accounts.

Finally, I end with a "Clear this page" button because certain fields are stored in the browser tab's [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).
This is done so the tables persist per tab after refreshing.
Behind the scenes, I developed [**ScopedStorage**](https://github.com/eugenius1/scoped-storage), a simple wrapper around sessionStorage and localStorage to mimic storage per web page.

### Robustness

After building a Minimum Viable Product, the next step was to refine and make it more robust.
Also, getting **feedback from friends** was vital in making sure it works well and is **easy to use**.
Instructions on my web page were made as clear as possible and if the user does a step wrongly,
then the code should give a hint to what the problem is where possible.
For example, below a try-catch was added with a hint in case something went wrong.

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

#### Maximum list sizes

One thing I wondered was the maximum list sizes of followings and followers that can be retrieved.
So I pretended to be [Cristiano Ronaldo](https://www.instagram.com/cristiano/) with 274 million followers!
I then got another `429 Too Many Requests` error.
The lists are paginated with up to 50 accounts per page (not always 50 in reality)
and I managed 200 pages so that's up to 10,000 accounts combined followings and followers (including duplicates).

From my testing, I discovered this page limit is per 15 minutes so it would give 4.5 seconds between each call for the next page (15&times;60/200 = 4.5).
I took into account the API's average latency on my laptop of ~400 ms so I set the delay in the for-loop to 4.1 seconds.
You can check HTTP request durations in the Network tab of the developer tools.
With a little more testing I found that I could reach 370 pages with this delay so that's up to 18,500 combined list sizes,
so still very far from Cristiano's millions.

With this info on page limits, I wrote the code to either do 200 total pages without waiting or 370 with the aforementioned delays.
However, only the 200-pages method is currently activated.

#### Handling HTTP errors

With all my testing, I came to know the `429 Too Many Requests` error too well;
so while the other HTTP errors are caught and continue to the next list item, this one is treated differently.
When fetching lists, the function is aborted whereas when fetching more details per account, there is a 30-minute pause and then the failed account is retried.
I also added an `abort()` function that can be run to halt any for-loop and get data fetched so far.

Another possibility to consider is that the HTTP status is ok but instead of receiving JSON, you get HTML with a visible message.
In this case, the code shows a hint:

```js
async function getLists() {
  // ...
  try {
    response = await response.json();
  } catch (error) {
    console.error(`Detected that you may need to verify your account. Stopping. Failed at page number ${pageCount.toLocaleString()} (during ${config.name} list).`, error);
    doAbort = true;
    break;
  }
  // ...
}
```

## Conclusion & user feedback

Did I solve my problem? Definitely!

![Number of accounts I follow reduced from 1079 to 928, a reduction of 151](/img/projects/instagram-lists/my-result.jpg){:.golden-width}

In building this tool, I also empowered others to manage the accounts they follow:

> That is a very cool tool! The output is **easy to interpret** and the **instructions work pretty well** for allowing me to **pick what I want to view** in the output

![Positive user feedback from several users](/img/projects/instagram-lists/user-feedback.png){:.golden-width}

I hope this article helps you to understand the [source code](https://github.com/eugenius1/eugenius1.github.io/tree/master/projects/instagram-lists)
and maybe even empower you to build other tools.
I am always open to feedback.
