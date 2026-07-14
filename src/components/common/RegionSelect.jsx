export default function RegionSelect({ value, onChange, style }) {
  return (
    <select className="f-sel" value={value} style={style} onChange={(e) => onChange(e.target.value)}>
      <option value="Global">Global</option>
      <option value="AMER">AMER</option>
      <option value="EMEA">EMEA</option>
      <option value="APJ">APJ</option>
    </select>
  );
}
