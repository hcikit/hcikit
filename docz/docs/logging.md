# Logging

### What is logged automatically

We automatically log the start and end of everything. Only leaf nodes receive log statements. We also log the redux actions that are called with their timestamp.

This looks like:

```{json}
{
  /* Configuration properties */
  "task": "Fitts",
  "width": 10,
  "distance": 5,

  /* Logging */
  "start": 1560441332267,
  "end": 1560441341690,
  "actions" : [
    {
      action : {
      type: "ADVANCE_WORKFLOW"
    },
    timestamp: 1560441341690 }
  ]
}
```

But you can log your own things as well.
