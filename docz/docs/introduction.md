# Introduction

## HCI Kit

HCI Kit is a set of reusable tools for running browser-based human experiments. It handles a variety of issues for you and covers a lot of the boilerplate so you only need to worry about the research question you're investigating.

Greg and I built the framework when we realised we were writing code for three things repeatedly: a task router to choose what to display to the user, a logger to save the participant data, and components like demographics, consent forms, and tutorial screens.

We have an opinionated way of using our framework, but the framework itself is very flexible. It has two packages: workflow and tasks. Workflow is a task router and tasks are some pre-built components.

### Workflow

Most experiments, whether in the lab, crowdsourced or just remote, are simply a series of different tasks. The participant signs the consent form, fills out a pre-questionnaire, completes some experimental tasks and then continues on with their day.

We found that we were writing our experiments as huge state machines that decided which state came next, and editing that was extremely time consuming. Workflow takes a special JSON configuration and uses that to decide what should be rendered on the screen.

The configuration is designed to be read by humans, but flexible enough you can organise your experiment however you want. We don't decide how many blocks you use or if you refer to things as blocks or trials.

To make logging easy, we automatically log participant data back into the configuration file. We do this because an experiment task should be entirely paramterised by its configuration. By logging back into the configuration you have everything you need to analyse a trial already in the logs. We also log certain things automatically, like the start and end of a trial. This is often enough logging for most experiments.

The next issue we had was that most experiments needed a server. But servers are hard to maintain and add a serious level of complexity to your project, it's really just another thing to break. Instead we rely on Amazon S3 to handle everything. We deploy a static website to S3 and upload participant log files using the API.

The core philosophy behind HCI Kit is opinionated, but flexible.

### Tasks

We've also run a lot of experiments using HCI Kit which means we've already built the standard building blocks you need. Consent forms, questionnaires, Fitts law, instructions. We've included all of these in @hcikit/tasks.
