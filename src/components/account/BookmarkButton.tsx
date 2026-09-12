"use client";
import { useActionState } from "react";
import { setBookmark } from "@/app/account/member-actions";
import SubmitButton from "./SubmitButton";
export default function BookmarkButton({
  id,
  saved,
}: {
  id: string;
  saved: boolean;
}) {
  const [state, action] = useActionState(setBookmark, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="save" value={saved ? "no" : "yes"} />
      <SubmitButton className="member-secondary">
        {saved ? "✓ Opgeslagen · verwijderen" : "+ Bewaren voor later"}
      </SubmitButton>
      {state.error && (
        <p role="alert" className="member-error">
          {state.error}
        </p>
      )}
      {state.success && (
        <span className="sr-only" role="status">
          {state.success}
        </span>
      )}
    </form>
  );
}
