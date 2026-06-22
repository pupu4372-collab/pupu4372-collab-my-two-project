import { ChallengeDetailPage } from "@/components/community/challenge/ChallengeDetailPage";

export default function ChallengeDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ChallengeDetailPage params={params} />;
}
