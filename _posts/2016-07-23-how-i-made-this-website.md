---
layout: post
title: How I made this website!
share-img: "http://eusebius.tech/img/blog/2016/theme-history.gif"
---

**TL;DR**: Domain name from [hover.com](https://hover.com/Yiflhr2y), free hosting through [GitHub Pages](https://pages.github.com/), and theme by [*Beautiful Jekyll*](http://deanattali.com/beautiful-jekyll/ "beautiful-jekyll homepage"). Content written in Markdown.

---

Why bother making a website? 
For me, this website is my own personal space on the web that I'm in control of. I can quickly link anyone to pages like [eusebius.tech/uber](/uber "Free Uber ride"). 
The bare minimum to having your own website is finding a place to host it and adding your content. Most people go for blogging services like WordPress but I wanted more than just a blog.

# Website domain name

I had to choose a website domain name that I could spell out in a few seconds yet you could remember after some months or even years. *Shortness vs Reliability*. There were three contenders and in the end I settled on the middle ground and that's `eusebius.tech`. This domain name just has my first name and I like that the extension captures my techie personality.

You buy a domain name from a registrar; I bought mine from [hover.com](https://hover.com/Yiflhr2y). Other reputable registrars exist ([name.com](https://www.name.com/), [GoDaddy](https://www.godaddy.com/), [namecheap](https://www.namecheap.com/)) but I chose hover because they offer free *Whois* privacy and my total cost for the first year was less than US $14. The first year price was heavily discounted, compared to $55 for the second year. You can [donate](/donate "Donate to Eusebius.Tech") towards a renewal.

![alt text](/img/blog/2016/hover-renewal.png "Domain renewal for a second year")

*Whois* is a service that gives you information about the registered user of domain name. Without privacy, my home address and phone number would be publicly available. With privacy, you get [masked contact info](http://www.whois.com/whois/eusebius.tech).

# Hosting

Before eusebius.tech, I was hosting a simpler website through [GitHub Pages](https://pages.github.com/) at [eugenius1.github.io](http://eugenius1.github.io) (which now links to this domain). GitHub Pages can host a static website from a repository as well as project pages. A static website is like a folder containing fully-rendered contents, whereas a dynamic website is like a program which runs on a server and produces content when you make a request.

The beauty of GitHub Pages is that I can have my website hosted, for free, at a custom domain. This is true freedom, taking my website name from `eugenius1.github.io` to a much more friendly `eusebius.tech`. One downside is that I lose https as I now would have to implement a secure connection myself instead of GitHub doing that for me.

The screenshot belows shows the DNS Records for my domain. These are just settings for where subdomains lie. The key settings for the transfer from GitHub Pages are `A`-records for `@` and `*`. `CNAME`-record for `www` is for having the subdomain `www.eusebius.tech`, which for me links to the apex domain `eusebius.tech`. [Read more on setting up custom domains on GitHub Pages](https://help.github.com/articles/about-supported-custom-domains/ "GitHub Pages: About supported custom domains").

![alt text](/img/blog/2016/hover-dns.png "DNS settings on hover.com")

# Theme

A theme can drastically affect a website's impression.

[![alt text](/img/blog/2016/theme-history.gif "GIF of website transformation")](/raw/ img/blog/2016/theme-history.gif)

The theme I'm using is [*Beautiful Jekyll*](http://deanattali.com/beautiful-jekyll/ "beautiful-jekyll homepage"), and it goes beyond providing some [css](http://www.w3schools.com/css/css_intro.asp "Cascading Style Sheets")'s and visuals. It's more of a framework, built on top of Jekyll. [Jekyll](https://jekyllrb.com/) is a static-site generator.

## Features

- **Disqus**: commenting
- **Google Analytics**: viewer statistics
- **RSS Feed**
- **Animated cover images**

The features above are built-in very well as all I had to was fill in my [Disqus shortname](https://help.disqus.com/customer/portal/articles/466208) and [Google Analytics ID](https://support.google.com/analytics/answer/1008080) in the configurations file.

# Email

With [hover.com](https://hover.com/Yiflhr2y) I pay $5 a year for email forwarding. This price is only for one email address on your domain. All emails sent to [me@eusebius.tech](mailto:me@eusebius.tech) are forwarded to my personal Gmail address.

I would highly recommend [improvmx.com](http://improvmx.com/), which is free. All emails to your domain can be forwarded to a single email address. The only caveat is that you have one shot at making the setting on improvmx. I made a mistake in the email address to forward to and as of writing this post, I haven't been able to modify their record. Thus, I'm back to hover's service.

# Webpage content

Last but not least is filling webpages with content or making a blog post. HTML, the language to markup webpages looks as shown below. Those opening and closing `<>` tags can be tedious and not to mention intimidating to beginners. This is where Markdown comes to the rescue, as shown further below. Markdown is a lightweight markup language that simplifies and quickens writing up content. Markdown is converted to HTML.

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

Of course, you could use *Microsoft Word* or a similar program to write content and save as HTML. I have already been quite accustomed to Markdown thanks to GitHub and I find it at least as convenient as clicking buttons to format text. One thing I believe for sure, is that Markdown is quicker to pickup than pure HTML because Markdown is a lot more intuitive to read and write for us, humans.


Comment below on your experiences of making your own website. Was it WordPress? If you're following this as a guide, feel free to get in touch for any clarifications.