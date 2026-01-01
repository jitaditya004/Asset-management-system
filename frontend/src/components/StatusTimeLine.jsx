
import { STATUS_STYLES,DEFAULT_STYLE } from "../config/StatusStyle";


export function StatusTimeline({ history }) {
  if (!history || history.length === 0) {
    return <div className="text-gray-400 text-sm">No History</div>;
  }

  return (
    <div className="space-y-4">
      {history.map((item, i) => {
        const styles = STATUS_STYLES[item.new_status] || DEFAULT_STYLE;

        return (
          <div key={i} className="flex gap-4">
            {/* dot + line */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${styles.dot}`} />
              {i !== history.length - 1 && (
                <div className={`w-px h-full ${styles.line}`} />
              )}
            </div>

            {/* content */}
            <div className="pb-4">
              <p className={`text-sm font-medium ${styles.text}`}>
                {item.new_status}
              </p>

              <p className="text-xs text-gray-500">
                {new Date(item.changed_at).toLocaleDateString()}
                {item.full_name && ` · ${item.full_name}`}
              </p>

              {item.reason && (
                <p className="text-sm text-gray-600 mt-1">
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
