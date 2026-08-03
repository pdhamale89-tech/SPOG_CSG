import ComingSoonOverlay from './ComingSoonOverlay';

export default function InsightBox({ text }) {
  return (
    <ComingSoonOverlay>
      <div className="insight-box">
        <span className="ins-ic">✦</span>
        <span>{text}</span>
      </div>
    </ComingSoonOverlay>
  );
}
