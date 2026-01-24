export type ConciergeMessage = {
  role: "user" | "assistant";
  content: string;
};

const cannedResponses = [
  "I can help you compare buyer-ready opportunities across Lisbon, Dubai, and Cape Town with legal steps in mind.",
  "Try zooming into your target neighbourhood, then tap ‘Search this area’ to focus on what you can actually buy there.",
  "Switch your display currency in the header to sense-check pricing before you make an offer.",
  "The Buy Journey page outlines the steps from offer to completion and what documents to request early."
];

export async function getConciergeReply(history: ConciergeMessage[]) {
  const prompt = history[history.length - 1]?.content ?? "";
  const seededIndex = Math.abs(
    prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % cannedResponses.length;

  return new Promise<ConciergeMessage>((resolve) =>
    setTimeout(
      () =>
        resolve({
          role: "assistant",
          content: cannedResponses[seededIndex]
        }),
      200
    )
  );
}
