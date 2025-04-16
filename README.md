---
title: Nao Medical
description: Healthcare Translation App
author: Joshua Eze
created:  2025 Apr 16
updated: 2025 Apr 16
---

Nao Medical
=========

## Development
I started with the main page to design the translation app. The web speech api was used for recorded audio, and translated text audio playback. To limit traffic on the generative AI (OpenAI) endpoint, debouncing was implemented, as well as error handling to catch translation and transcipting failures.

I finally moved onto the api folder to design the handler to translate the transcript. The OpenAI model was designed with redaction of patient names, doctor names, and private details for HIPAA privacy. I also purified the dom as a security measure for XSS attacks.

__User guide is on the right-top corner of the page__

## Deployment

https://nao-medical-i8e2.vercel.app




