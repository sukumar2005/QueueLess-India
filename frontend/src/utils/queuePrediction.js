// QueueLess India
// Smart Queue Waiting-Time Prediction

export function predictQueue({
  peopleWaiting = 0,
  averageServiceTime = 15,
  availableOfficers = 1,
  totalOfficers = 1,
}) {
  const waiting = Math.max(0, Number(peopleWaiting) || 0);

  const serviceTime =
    Math.max(1, Number(averageServiceTime) || 15);

  const officers =
    Math.max(1, Number(availableOfficers) || 1);

  const total =
    Math.max(officers, Number(totalOfficers) || officers);

  // ------------------------------------------
  // ESTIMATED WAITING TIME
  // ------------------------------------------
  const predictedWait = Math.ceil(
    (waiting * serviceTime) / officers
  );

  // ------------------------------------------
  // CROWD / DEMAND LEVEL
  // ------------------------------------------
  let demandLevel;
  let crowdStatus;

  if (waiting === 0) {
    demandLevel = "Low";
    crowdStatus = "🟢 Low";
  } else if (waiting <= 3) {
    demandLevel = "Moderate";
    crowdStatus = "🟡 Moderate";
  } else if (waiting <= 7) {
    demandLevel = "High";
    crowdStatus = "🟠 High";
  } else {
    demandLevel = "Very High";
    crowdStatus = "🔴 Very High";
  }

  // ------------------------------------------
  // OFFICER CAPACITY
  // ------------------------------------------
  const officerAvailability =
    officers >= total
      ? "All counters available"
      : `${officers} of ${total} counters available`;

  // ------------------------------------------
  // RECOMMENDATION
  // ------------------------------------------
  let recommendation;

  if (waiting === 0) {
    recommendation =
      "No queue currently. This is a good time to visit.";
  } else if (predictedWait <= 15) {
    recommendation =
      "Short waiting time. You can visit now.";
  } else if (predictedWait <= 30) {
    recommendation =
      "Moderate waiting time. Consider arriving soon.";
  } else {
    recommendation =
      "High waiting time. Consider visiting later if possible.";
  }

  // ------------------------------------------
  // PROTOTYPE VISIT RECOMMENDATION
  // ------------------------------------------
  let recommendedTime;

  if (waiting === 0) {
    recommendedTime = "Now";
  } else if (predictedWait <= 15) {
    recommendedTime = "Now";
  } else if (predictedWait <= 30) {
    recommendedTime = "Within 30 minutes";
  } else {
    recommendedTime = "Later";
  }

  return {
    predictedWait,
    demandLevel,
    crowdStatus,
    officerAvailability,
    recommendedTime,
    recommendation,
  };
}