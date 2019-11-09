function generateFittsBlock(numTargets) {
  let tasks = [0];

  for (var i = 0; i < numTargets - 1; i++) {
    tasks.push(
      (Math.floor(numTargets / 2) + tasks[tasks.length - 1]) % numTargets
    );
  }

  return tasks.map(targetIndex => ({ targetIndex }));
}

export default {
  tasks: ["DOMEventLogger"],
  children: [
    {
      task: "InformationScreen",
      label: "Information",
      shortcutEnabled: true,
      centerY: true,
      centerX: true,
      content: `# Hello World
this is *markdown*`
    },

    {
      label: "Consent",

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
      task: "Fitts",
      children: [
        {
          width: 5,
          distance: 10,
          numTargets: 7,
          children: generateFittsBlock(7)
        },
        {
          width: 1,
          distance: 45,
          numTargets: 7,
          children: generateFittsBlock(7)
        },
        {
          width: 3,
          distance: 20,
          numTargets: 7,
          children: generateFittsBlock(7)
        }
      ]
    }
  ]
};
