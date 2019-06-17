export default {
  CustomTask: {
    text: "Click to continue"
  },
  participant: "yo",
  children: [
    {
      task: "InformationScreen",
      shortcutEnabled: true,
      centerY: true,
      centerX: true,
      content: "# Hello World"
    },
    {
      task: "DisplayText",
      content: "Hello"
    },
    {
      task: "ConsentForm",
      letter: `# Consent Form

The consent form uses markdown to create a letter, and it automatically generates as many checkboxes as needed to consent.`,
      questions: [
        {
          label:
            "I consent of my free will to complete this example experiment",
          required: true
        }
      ]
    },
    {
      task: "CustomTask"
    },
    {
      task: "IncrementTask",
      desiredValue: 20
    }
  ]
};
