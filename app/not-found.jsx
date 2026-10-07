import Link from "next/link";
export default function NotFound() {
  return (
    <div className="info-page">
      <span className="eyebrow">LUNA TERMINAL / 404</span>
      <h1>This view isn’t in your workspace.</h1>
      <p>
        Return to the market dashboard, or start a conversation to find the
        right research tool.
      </p>
      <Link className="button primary" href="/dashboard">
        Open your dashboard
      </Link>
    </div>
  );
}
