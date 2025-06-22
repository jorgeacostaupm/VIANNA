export default function Progress({ text, percentage }) {
  percentage = percentage ?? 0;
  return (
    <div className="progressContainer">
      <div
        className="progressBar"
        style={{ width: `${percentage}%` }}
        title={`${percentage.toFixed(2)}%`}
      >
        {text} ({`${percentage.toFixed(2)}%`})
      </div>
    </div>
  );
}
