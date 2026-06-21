import Avatar from "./Avatar";

export default function PlayerChip({ player }) {
  return (
    <span className={`tl-pchip${player.captain ? " cap" : ""}${player.sub ? " sub" : ""}`}>
      <Avatar initials={player.initials} size={18} seed={player.captain && !player.sub} />
      {player.firstName} {player.lastName}
      <span className="pd">{player.dupr.toFixed(1)}</span>
    </span>
  );
}
