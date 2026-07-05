import Avatar from "./Avatar";
import PlayerChip from "./PlayerChip";

export default function TeamRow({ team, showRoster = true }) {
  return (
    <div className="tl-team">
      <div className="tl-trow">
        <div className="tl-tseed">{team.seed}</div>
        <Avatar initials={team.initials} size={40} seed={team.seed === 1} />
        <div className="tl-tinfo">
          <div className="tl-tname">{team.name}</div>
          <div className="tl-tloc">{team.location}</div>
        </div>
        {showRoster ? (
          <div className="tl-tplayers">
            <div className="tl-prow">
              {team.players.map((player) => (
                <PlayerChip key={`${player.firstName}-${player.lastName}`} player={player} />
              ))}
            </div>
            {team.subs?.length ? (
              <div className="tl-prow">
                <span className="tl-subs-label">Subs</span>
                {team.subs.map((player) => (
                  <PlayerChip key={`sub-${player.firstName}-${player.lastName}`} player={player} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="tl-tdupr">
          <div className="tl-tdupr-n">{team.teamDupr}</div>
          <div className="tl-tdupr-l">Team DUPR</div>
        </div>
      </div>
    </div>
  );
}
