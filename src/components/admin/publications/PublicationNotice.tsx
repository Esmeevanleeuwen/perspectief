export default function PublicationNotice({ deleted }: { deleted: boolean }) {
  return deleted ? <p role="status" className="member-notice">Publicatie verwijderd.</p> : null;
}
