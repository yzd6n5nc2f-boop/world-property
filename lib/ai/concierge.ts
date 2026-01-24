export type ConciergeMessage = {
  role: "user" | "assistant";
  content: string;
};

const cannedResponses = [
  "I can help you compare buy vs stay opportunities in Lisbon, Dubai, and Cape Town.",
  "Try zooming into your ideal neighbourhood, then tap ‘Search this area’ for a tighter match.",
  "For stays, add your dates to see the nightly estimate and total trip cost.",
  "Saved searches will notify you here once new listings match your criteria (coming soon)."
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
