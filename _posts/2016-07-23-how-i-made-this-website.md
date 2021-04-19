---
layout: post
title: How I made this website!
subtitle: An overview to having your own website
share-img: "http://eusebius.tech/img/blog/2016/website-launch-screenshot.png"
share-img-cannot-be-wide: true
redirect_from:
 - "/b/himtw/"
---

**<abbr title="Too long; didn't read">TL;DR</abbr>**: Domain name from [hover.com](https://hover.com/Yiflhr2y "$2 discount link"), free hosting through [GitHub Pages](https://pages.github.com/), and theme by [*Beautiful Jekyll*](http://deanattali.com/beautiful-jekyll/), with content written in [Markdown](#webpage-content).

---

Why bother making a website? 
For me, this website is my own personal space on the web that I'm in control of. I can quickly link anyone to pages like [eusebius.tech/uber](/uber "Free Uber ride"). 
The bare minimum to having your own website is finding a place to host it and adding your content. Most people go for blogging services like WordPress but I wanted more than just a blog.

- TOC
{:toc}

## Website domain name

I had to choose a website domain name that I could spell out in a few seconds yet you could remember after some months or even years. *Shortness vs Reliability*. There were three contenders and in the end, I settled on the middle ground that is `eusebius.tech`. This domain name just has my first name and I like that the extension captures my techie personality.

You buy a domain name from a registrar; I bought mine from [hover.com](https://hover.com/Yiflhr2y "$2 discount link"). Other reputable registrars exist ([name.com](https://www.name.com/), [GoDaddy](https://www.godaddy.com/), [Namecheap](https://www.namecheap.com/)) but I chose hover because they offer free *Whois* privacy and my total cost for the first year was less than US $14. The first year price was heavily discounted, compared to $55 for the second year. You can [donate](/donate "Donate to Eusebius.Tech") towards a renewal.

`.tech` has the premium annual price of $49.99 but other usual top-level domains like `.com` ($14.99) and `.co.uk` ($9.99) mostly cost far less.

![Domain renewal for eusebius.tech is $49.99 for 1 year. Mail forward option is chosen, which costs $5 per year. An ICANN fee of $0.18 makes the total $55.17.](/img/blog/2016/hover-renewal.png "Domain renewal for a second year")

*Whois* is a service that gives you information about the registered user of a domain name. Without privacy, my home address and phone number would be publicly available. With privacy, you get [masked contact info](http://www.whois.com/whois/eusebius.tech).

## Hosting

Before eusebius.tech, I was hosting a simpler website through [GitHub Pages](https://pages.github.com/) at [eugenius1.github.io](http://eugenius1.github.io) (which now links to this domain). GitHub Pages can host a static website from a repository as well as project pages. A static website is like a folder containing fully-rendered contents, whereas a dynamic website is like a program which runs on a server and produces content when someone requests a page.

The beauty of GitHub Pages is that I can have my website hosted, for free, at a custom domain. This is true freedom, taking my website name from `eugenius1.github.io` to a much more friendly `eusebius.tech`. One downside is that I lose https as I now would have to implement a secure connection myself instead of GitHub doing that for me.

The screenshot below shows the <abbr title="Domain Name System">DNS</abbr> Records for my domain. These are just settings for where subdomains lie. The key settings for the transfer from GitHub Pages are `A`-records for `@` and `*`. `CNAME`-record for `www` is for having the subdomain `www.eusebius.tech`, which for me links to the apex domain `eusebius.tech`. Read more on [setting up custom domains on GitHub Pages](https://docs.github.com/en/github/working-with-github-pages/about-custom-domains-and-github-pages).

![5 entries in the DNS records.](/img/blog/2016/hover-dns.png "DNS settings on hover.com")

## Theme

A theme can drastically affect a website's impression. See versions [1](/index-v1.html) and [2](/index-v2.html) of my homepage.

[![The homepage transforms from a simple `Hello, world! It's Eusebius` on a blank white page to another with more text and finally to the current, more polished version with `Hi, I'm Eusebius`.](/img/blog/2016/theme-history.gif "GIF of website transformation")](/raw/img/blog/2016/theme-history.gif)

The theme I'm using is [*Beautiful Jekyll*](http://deanattali.com/beautiful-jekyll/), and it goes beyond providing some [css](http://www.w3schools.com/css/css_intro.asp "Cascading Style Sheets")'s and visuals. It's more of a framework, built on top of Jekyll. [Jekyll](https://jekyllrb.com/) is a static-site generator.

### Features

- **Disqus**: commenting
- **Google Analytics**: viewer statistics
- **RSS Feed**
- **Animated cover images**

The features above are built-in very well as all I had to do was fill in my [Disqus shortname](https://help.disqus.com/customer/portal/articles/466208) and [Google Analytics ID](https://support.google.com/analytics/answer/1008080) in the configurations file.

## Email

With [hover.com](https://hover.com/Yiflhr2y "$2 discount link") I pay $5 a year for email forwarding. This price is only for one email address on my domain. All emails sent to [me@eusebius.tech](mailto:me@eusebius.tech) are forwarded to my personal Gmail address.

I would highly recommend [improvmx.com](http://improvmx.com/), which is free. All emails to your domain can be forwarded to a single email address. The only caveat is that you have one shot at making the setting on improvmx. I made a mistake in the email address to forward to and as of writing this post, I haven't been able to modify their record. Thus, I'm back to hover's email-forwarding service.

## Webpage content

Last but not least, is filling webpages with content or making a blog post. <abbr title="HyperText Markup Language">HTML</abbr>, the language to markup webpages looks as shown below. Those opening and closing `<>` tags can be tedious and not to mention intimidating to beginners. This is where Markdown comes to the rescue, as shown further below. Markdown is a lightweight markup language that simplifies and quickens writing up content. Markdown is converted to HTML by Jekyll.

### HTML

```html
<h1>Heading</h1>

<h2>Sub-heading</h2>

<p>Text attributes <em>italic</em>, <strong>bold</strong>, <code>monospace</code>.</p>

<p>Bullet list:</p>

<ul>
  <li>apples</li>
  <li>oranges</li>
</ul>

<p>A <a href="http://example.com">link</a>.</p>
```

### Markdown

```markdown
# Heading

## Sub-heading

Text attributes *italic*, **bold**, `monospace`.

Bullet list:

* apples
* oranges

A [link](http://example.com).
```

Of course, you could use *Microsoft Word* or another word processor to write content and save as HTML. I have already been quite accustomed to Markdown thanks to GitHub and I find it at least as convenient as clicking buttons to format text. One thing I believe for sure is that Markdown is quicker to pick up than pure HTML because Markdown is a lot more intuitive to read and write for us humans.

Comment below on your experiences of making your own website. Did you use WordPress? If you're following this as a guide, feel free to get in touch for any clarifications.

---

**Update** 27/03/2021: I now use [Google Domains](https://domains.google/) as my registrar instead of hover.com.
They allow free email forwarding to a single email address.
The caveat is no PayPal so you have to remember to update your payment card before it expires.
