import type { LifecycleStatus } from "../lifecycle.js";

export type LifecycleAction = "review" | "build" | "revise" | "accept" | "archive";

const ALLOWED_STATES: Record<LifecycleAction, readonly LifecycleStatus["state"][]> = {
  review: ["proposed", "reviewed"],
  build: ["proposed", "reviewed", "revision-needed", "built"],
  revise: ["built", "revision-needed"],
  accept: ["built", "revision-needed"],
  archive: ["accepted"]
};

export function assertLifecycleAction(
  status: LifecycleStatus,
  action: LifecycleAction,
  options: {
    explicitUserAcceptance?: boolean;
    followUpWorkCompleted?: boolean;
  } = {}
): void {
  if (action === "archive" && status.state !== "accepted") {
    throw new Error(`Change "${status.change}" must be accepted before archive.`);
  }

  if (!ALLOWED_STATES[action].includes(status.state)) {
    throw new Error(
      `Change "${status.change}" cannot transition from state "${status.state}" using "${action}".`
    );
  }

  if (action === "build" && status.state === "proposed" && status.review.state === "required") {
    throw new Error(`Change "${status.change}" requires completed review before build.`);
  }

  if (action === "accept") {
    if (options.explicitUserAcceptance !== true) {
      throw new Error(`Change "${status.change}" requires explicit user acceptance.`);
    }

    if (status.state === "revision-needed" && options.followUpWorkCompleted !== true) {
      throw new Error(`Change "${status.change}" must be built before acceptance.`);
    }
  }

  if (
    action === "archive" &&
    (status.acceptance.explicit !== true || status.acceptance.acceptedAt === undefined)
  ) {
    throw new Error(`Change "${status.change}" must have explicit acceptance recorded before archive.`);
  }
}
