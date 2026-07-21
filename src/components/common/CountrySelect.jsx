export default function CountrySelect({ value, onChange, style }) {
  return (
    <select className="f-sel" value={value} style={style} onChange={(e) => onChange(e.target.value)}>
      <option value="All">All Countries</option>
      <option value="US">US</option>
      <option value="UK">UK</option>
      <option value="India">India</option>
      <option value="Canada">Canada</option>
      <option value="Germany">Germany</option>
      <option value="Australia">Australia</option>
    </select>
  );
}
