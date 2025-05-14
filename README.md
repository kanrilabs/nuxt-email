<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: Nuxt Email
- Package name: nuxt-email
- Description: Runtime agnostic email builder and sender for Nuxt
-->

# Nuxt Email

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Fully typed, runtime agnostic email module for Nuxt. Handles all boundary handling and MIME part creation. You just need to provide the email content and headers.

> [!WARNING]
> This module is still under development and the API is not yet stable.

> [!IMPORTANT]
> This is a low level api for building emails. It also only supports SES for now.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-email?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- Low level API for building emails
  - Headers
  - Text and HTML bodies
  - Attachments
  - Embedded images
- Send emails with SES
- Automatic SNS subscription confirmation
- Receive and handle email event notifications with SNS
  - Send
  - Delivery
  - Bounce
  - Complaint
  - Reject
  - Complaint
  - Open
  - Click

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add @kanrilabs/nuxt-email
```

That's it! You can now use Nuxt Email in your Nuxt app ✨


## Usage

### Sending Emails

Currently there are two functions:
- `email.message` for building emails
- `email.send` for sending emails

```ts
// server/api/email.post.ts
export default defineEventHandler(async (event) => {
  const email = useEmail(event)
  const message = email.message({
    From: 'hello@example.com',
    To: 'world@example.com',
    Subject: 'Hello, world!',
  }, [
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
      content: 'Hello, world!',
    },
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      content: '<p>Hello, world!</p><img src="cid:image1" />',
    },
    {
      headers: {
        'Content-Type': 'image/png; name=image.png',
        'Content-Disposition': 'inline',
        'Content-Transfer-Encoding': 'base64',
        'Content-ID': '<image1>',
      },
      content: '...',
    },
    {
      headers: {
        'Content-Type': 'application/pdf; name=document.pdf',
        'Content-Disposition': 'attachment',
        'Content-Transfer-Encoding': 'base64',
      },
      content: '...',
    },
  ])

  // Returns the MessageId from SES
  const messageId = await email.send(message, {
    // Optional callbacks
    onSend: async (event, data) => {
      console.log(data) // { MessageId: '...' }
    },
    onError: (event, error) => {
      console.error(error)
    },
  })
})
```

### SES Notifications

Use the `defineSESEventHandler` function to handle SES notifications and SNS messages.  
Store mail delivery status in a database or other storage. (messages are not guaranteed to be delivered in order)

> [!IMPORTANT]
> Currently, the SNS messages are not being verified. I've tried doing this without libraries to keep the package size small, but it's not working.
> You can find my work in progress in the branch `sns-verify`.

```ts
// server/ses/event.post.ts
export default defineSESEventHandler({
  // SES Notifications
  onBounce: (event, { mail, bounce }) => { },
  onClick: (event, { mail, click }) => { },
  onComplaint: (event, { mail, complaint }) => { },
  onDelivery: (event, { mail, delivery }) => { },
  onDeliveryDelay: (event, { mail, delay }) => { },
  onOpen: (event, { mail, open }) => { },
  onReject: (event, { mail, reject }) => { },
  onRenderingFailure: (event, { mail, failure }) => { },
  onSend: (event, { mail, send }) => { },
  onSubscription: (event, { mail, subscription }) => { },

  // SNS Messages
  onNotification: (event, message) => {
    // Runs before the above SES notifications
    // The SES notification as a json string can be found in `message.Message`
  },
  onSubscribe: (event, message) => {
    // Runs before making a GET request to the received subscription URL
  },
  onUnsubscribe: (event, message) => {
    // Runs on unsubscribe
  },
})
```




## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@kanrilabs/nuxt-email/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@kanrilabs/nuxt-email

[npm-downloads-src]: https://img.shields.io/npm/dm/@kanrilabs/nuxt-email.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@kanrilabs/nuxt-email

[license-src]: https://img.shields.io/npm/l/@kanrilabs/nuxt-email.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@kanrilabs/nuxt-email

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
