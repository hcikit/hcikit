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
};
