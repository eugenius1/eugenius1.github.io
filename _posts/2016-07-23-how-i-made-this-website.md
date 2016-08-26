---
layout: post
title: How I made this website!
---

<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.7&appId=1009749102479073";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
<!-- Place this tag in your head or just before your close body tag. -->
<script src="https://apis.google.com/js/platform.js" async defer>
  {lang: 'en-GB'}
</script>

**TL;DR**: Domain name from [hover.com](https://hover.com/Yiflhr2y), free hosting through [GitHub Pages](https://pages.github.com/), and [*Beautiful Jekyll*](http://deanattali.com/beautiful-jekyll/ "beautiful-jekyll homepage") theme by Dean Attali.

---

Why bother making a website? 
For me, this website is my own personal space on the web that I'm in control of. I can quickly link anyone to pages like [eusebius.tech/uber](/uber "Free Uber ride"). 
The bare minimum to having your own website is finding a place to host it and adding your content. Most people go for blogging services like WordPress but I wanted more than just a blog.

# Website domain name

I had to choose a website domain name that I could spell out in a few seconds yet you could remember after some months or even years. *Shortness vs Reliability*. There were three contenders and in the end I settled on the middle ground and that's `eusebius.tech`. This domain name just has my first name and I like that the extension captures my techie personality.

You buy a domain name from a registrar; I bought mine from [hover.com](https://hover.com/Yiflhr2y). Other reputable registrars exist (name.com, GoDaddy, namecheap) but I chose hover because they offer free Whois privacy and my total cost for the first year was less than US $14. 

> Whois

![alt text](/img/blog/2016/hover-renewal.png "Domain renewal for a second year")

[Donate](/donate "Donate to Eusebius.Tech") towards a renewal.

# Hosting

Before eusebius.tech, I was hosting a simpler website through [GitHub Pages](https://pages.github.com/) at [eugenius1.github.io](http://eugenius1.github.io) (which now links to this domain). GitHub Pages can host a static website from a repository as well as project pages such as [this](http://eusebius.tech/ee3-rtdsp/ "EE3: Real-Time Digital Signal Processing"). A static website is like a folder containing fully-rendered contents, whereas a dynamic website is like a program which runs on a server and produces content when you make a request.

The beauty of GitHub Pages is that I can have my website hosted, for free, at a custom domain. This is true freedom, taking my website name from `eugenius1.github.io` to a much more friendly `eusebius.tech`. One downside is that I lose https as I now would have to implement a secure connection myself instead of GitHub doing that for me.

![alt text](/img/blog/2016/hover-dns.png "DNS settings on hover.com")

# Theme

> GIF of website transformation

## Features

- Disqus commenting
- Google Analytics
- RSS Feed
- Animated cover images

# Email

With [hover.com](https://hover.com/Yiflhr2y) I pay $5 a year for email forwarding. This price is only for one email address on your domain. All emails sent to [me@eusebius.tech](mailto:me@eusebius.tech) are forwarded to my personal Gmail address.

I would highly recommend you use [improvmx.com](http://improvmx.com/), which is free. All emails to your domain can be forwarded to a single email address. The only caveat is that you have one shot at making the setting on improvmx. I made a mistake in the email address to forward to and as of writing this post, I haven't been able to modify their record. Thus, I'm back to hover's service.

# Webpage content

### Markdown

```markdown
# Heading

## Sub-heading

### Another deeper heading
 
Paragraphs are separated
by a blank line.

Two spaces at the end of a line leave a  
line break.

Text attributes _italic_, *italic*, __bold__, **bold**, `monospace`.

Horizontal rule:

---

Bullet list:

  * apples
  * oranges
  * pears

Numbered list:

  1. apples
  2. oranges
  3. pears

A [link](http://example.com).
```

### HTML

```html
<h1>Heading</h1>

<h2>Sub-heading</h2>

<h3>Another deeper heading</h3>

<p>Paragraphs are separated
by a blank line.</p>

<p>Two spaces at the end of a line leave a<br />
line break.</p>

<p>Text attributes <em>italic</em>, <em>italic</em>, <strong>bold</strong>, <strong>bold</strong>, <code>monospace</code>.</p>

Horizontal rule:

<hr />

<p>Bullet list:</p>

<ul>
<li>apples</li>
<li>oranges</li>
<li>pears</li>
</ul>

<p>Numbered list:</p>

<ol>
<li>apples</li>
<li>oranges</li>
<li>pears</li>
</ol>

<p>A <a href="http://example.com">link</a>.</p>
```


<hr>
<div class="social-share">
  <span class="twitter">
    <a href="https://twitter.com/share" class="twitter-share-button" data-hashtags="EusebiusTech" data-show-count="true">Tweet</a><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
  </span>
  <span class="google">
    <g:plusone size="medium" href="http://eusebius.tech/blog/how-i-made-this-website/"></g:plusone>
  </span>
  <span class="facebook">
    <iframe src="https://www.facebook.com/plugins/like.php?href=http://eusebius.tech/blog/how-i-made-this-website/&amp;show_faces=false&amp;layout=button_count&amp;share=true" scrolling="no" frameborder="0" style="height: 21px;" allowTransparency="true"></iframe>
  </span>
</div>