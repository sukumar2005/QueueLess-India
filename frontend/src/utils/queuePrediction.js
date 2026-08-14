// QueueLess India
// AI Queue Prediction Engine

export function predictQueue({
  peopleWaiting = 0,
  averageServiceTime = 15,
  availableOfficers = 1,
  totalOfficers = 1,
}) {
  const officers = Math.max(
    availableOfficers,
    1
  );

  const estimatedWait = Math.ceil(
    (peopleWaiting * averageServiceTime) /
      officers
  );

  const demand = Math.min(
    Math.round(
      (peopleWaiting /
        Math.max(totalOfficers * 8, 1)) *
        100
    ),
    100
  );

  let demandLevel = "Low";

  if (demand >= 70) {
    demandLevel = "High";
  } else if (demand >= 40) {
    demandLevel = "Moderate";
  }

  let recommendation =
    "Queue conditions are currently favorable.";

  if (demandLevel === "Moderate") {
    recommendation =
      "Moderate demand detected. Consider visiting during the recommended period.";
  }

  if (demandLevel === "High") {
    recommendation =
      "High demand detected. Consider adding an officer during peak hours.";
  }

  const predictedWait = Math.max(
    estimatedWait - 5,
    5
  );

  return {
    estimatedWait,
    predictedWait,
    demand,
    demandLevel,
    recommendation,
    peakPeriod: "11:00 AM – 1:00 PM",
    recommendedTime: "10:30 AM",
  };
}