import { useRouter } from "next/router";

export default function ResultPage() {
  const router = useRouter();
  const result_id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  if (!result_id) {
    return;
  }

  return <>Hello there, {result_id}</>;
}
