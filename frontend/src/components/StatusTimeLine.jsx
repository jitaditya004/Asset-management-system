import { STATUS_STYLES, DEFAULT_STYLE } from "../config/StatusStyle";

export function StatusTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-white/50 italic">
        No lifecycle history available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {history.map((item, i) => {
        const styles = STATUS_STYLES[item.new_status] || DEFAULT_STYLE;

        return (
          <div key={i} className="flex gap-4 group">
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-3 h-3 rounded-full
                  ${styles.dot}
                  ring-4 ring-white/10
                  transition-transform
                  group-hover:scale-110
                `}
              />
              {i !== history.length - 1 && (
                <div
                  className={`
                    w-px flex-1
                    ${styles.line}
                    opacity-60
                  `}
                />
              )}
            </div>

            {/* Content */}
            <div
              className="
                pb-6
                transition
                group-hover:translate-x-0.5
              "
            >
              {/* Status */}
              <p className={`text-sm font-semibold tracking-wide ${styles.text}`}>
                {item.new_status}
              </p>

              {/* Meta */}
              <p className="text-xs text-white/50 mt-0.5">
                {new Date(item.changed_at).toLocaleDateString()}
                {item.full_name && (
                  <span className="text-white/40"> · {item.full_name}</span>
                )}
              </p>

              {/* Reason */}
              {item.reason && (
                <p
                  className="
                    mt-2
                    text-sm text-white/80
                    bg-white/5
                    border border-white/10
                    rounded-lg
                    px-3 py-2
                    max-w-xl
                  "
                >
                  {item.reason}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
