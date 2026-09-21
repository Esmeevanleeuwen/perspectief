import { publicationStatuses } from "./model";

export type PublicationStatusValue = (typeof publicationStatuses)[number]["value"];
export type StatusChangeInput = {
  id: string;
  status: PublicationStatusValue;
  updatedAt: string;
  confirmed?: boolean;
};
export type StatusChangeResult =
  | { confirmation_required: true; action: "publish" | "withdraw"; sites: string[] }
  | { confirmation_required: false; status: PublicationStatusValue; updated_at: string };

export function isPublicationStatus(value: unknown): value is PublicationStatusValue {
  return typeof value === "string" && publicationStatuses.some(option => option.value === value);
}
