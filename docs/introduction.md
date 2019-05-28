# Introduction

## HCI Kit

HCI Kit is a set of reusable tools for running browser-based human experiments. It handles a variety of issues for you and covers a lot of the boilerplate so you only need to worry about the experimental task you have at hand.

### Workflow

Most experiments, whether in the lab, crowdsourced or just remote, are simply a series of different tasks. The participant signs the consent form, fills out a pre-questionnaire, completes some experimental tasks and then continues on with their day.

We found that we were writing our experiments as huge state machines that decided which state came next, and editing that was extremely time consuming. Workflow takes a special configuration and uses that to decide what should be rendered on the screen.

The configuration is designed to be read by humans, but flexible enough you can organise your experiment however you want. We don't decide how many blocks you use or if you refer to things as blocks or trials.

For many things logging comes automatically. Under the hood state changes can choose to use the Redux store which stores all actions a user makes. This means we log everything by default in a manner that is easily capturable.

The next issue we had was that most experiments needed a server. HCI Kit includes tools for deploying the experiment to S3, and uses AWS S3 APIs to upload and download participant data. You can also choose to create

The core philosophy behind HCI Kit is opinionated, but flexible.

### Tasks

We've also run a lot of experiments using HCI Kit which means we've already built the standard building blocks you need. Consent forms, questionnaires, Fitts law, instructions. These are all in @hcikit/tasks.
