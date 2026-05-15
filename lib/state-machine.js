const STATES = [
  "NEW_LEAD",
  "PHOTO_CAPTURED",
  "AI_ANALYZED",
  "REVIEW_REQUIRED",
  "QUOTED",
  "APPROVED",
  "DISPATCHED",
  "IN_PROGRESS",
  "PROOF_SUBMITTED",
  "QA_REVIEW",
  "COMPLETE",
  "VARIANCE_RECORDED",
  "CLOSED_WON",
  "CLOSED_LOST",
];

const TRANSITIONS = {
  NEW_LEAD: ["PHOTO_CAPTURED", "REVIEW_REQUIRED", "CLOSED_LOST"],
  PHOTO_CAPTURED: ["AI_ANALYZED", "REVIEW_REQUIRED"],
  AI_ANALYZED: ["REVIEW_REQUIRED", "QUOTED"],
  REVIEW_REQUIRED: ["QUOTED", "CLOSED_LOST"],
  QUOTED: ["APPROVED", "CLOSED_LOST"],
  APPROVED: ["DISPATCHED", "REVIEW_REQUIRED"],
  DISPATCHED: ["IN_PROGRESS", "REVIEW_REQUIRED"],
  IN_PROGRESS: ["PROOF_SUBMITTED", "REVIEW_REQUIRED"],
  PROOF_SUBMITTED: ["QA_REVIEW"],
  QA_REVIEW: ["COMPLETE", "IN_PROGRESS", "REVIEW_REQUIRED"],
  COMPLETE: ["VARIANCE_RECORDED", "CLOSED_WON"],
  VARIANCE_RECORDED: ["CLOSED_WON"],
  CLOSED_WON: [],
  CLOSED_LOST: [],
};

const STATE_TO_GHL_STAGE = {
  NEW_LEAD: "New Lead",
  PHOTO_CAPTURED: "Photos Received",
  AI_ANALYZED: "Scope Review",
  REVIEW_REQUIRED: "Scope Review",
  QUOTED: "Quote Sent",
  APPROVED: "Approved",
  DISPATCHED: "Vendor Assignment",
  IN_PROGRESS: "In Progress",
  PROOF_SUBMITTED: "Photo Proof Review",
  QA_REVIEW: "Photo Proof Review",
  COMPLETE: "Completed",
  VARIANCE_RECORDED: "Review Requested",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

function isValidState(state) {
  return STATES.includes(state);
}

function canTransition(fromState, toState) {
  return isValidState(fromState) && isValidState(toState) && TRANSITIONS[fromState].includes(toState);
}

function assertTransition(fromState, toState) {
  if (!canTransition(fromState, toState)) {
    throw new Error(`Invalid Ready White lifecycle transition: ${fromState} -> ${toState}`);
  }

  return {
    fromState,
    toState,
    ghlStage: STATE_TO_GHL_STAGE[toState],
    eventType: `state_transitioned:${fromState.toLowerCase()}:${toState.toLowerCase()}`,
  };
}

module.exports = {
  STATES,
  TRANSITIONS,
  STATE_TO_GHL_STAGE,
  assertTransition,
  canTransition,
  isValidState,
};
