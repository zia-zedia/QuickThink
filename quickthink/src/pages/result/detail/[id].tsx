import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function ResultDetails() {
  const router = useRouter();
  const result_id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  if (!result_id) {
    return;
  }
}
