```js
<ConsentForm
  letter={`# Hello world
    this is *markdown*`}
  questions={[
    {
      label: "I agree of my own free will to participate in the study.",
      required: true
    }
  ]}
  onAdvanceWorkflow={action("onAdvanceWorkflow")}
/>
```
