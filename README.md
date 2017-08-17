# date-fns Dash Docs

[date-fns][] documentation for Dash

---
<!-- Everything below this point will not be included in the dist sent to Dash -->

![date-fns in Dash](https://dropsinn.s3.amazonaws.com/Screen%20Shot%202017-08-17%20at%202.56.36%20PM.png)

## Install Locally

The easiest way to install this is definitely through Dash, but you can also install locally. To do so, download
date-fns.tgz and extract it.

👉 [Download Here](https://github.com/iansinnott/date-fns-dash-docset/raw/master/dist/date-fns.tgz) 👈

Then in Dash go to:

```
Preferences > Docsets > + (the plus sign in the lower left) > Add Local Docset
```

Then chose `date-fns.docset` from the folder where you extracted it. You're all set. Just star the repo and you're done 😉.

## Build

### Install dependencies

You will need:

* `yarn`

Easiest option is probably brew:

Now, to build:

```
make
```

## Update

Need to create an automated update strategy...

## Possible Issues

I've disabled JS in the docs since it's not needed now that I rendered everything out to static files. However, the live site is built with React, and the app also queries firebase to download version numbers. None of that is happening in the docs but it's possible issues might arise from such JS-heavy docs running without JS.

[date-fns]: https://date-fns.org/
