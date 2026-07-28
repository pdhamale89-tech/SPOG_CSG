export default function SubRegionSelect({ value, onChange, style }) {
  return (
    <select className="f-sel" value={value} style={style} onChange={(e) => onChange(e.target.value)}>
      <option value="All">All Sub-Regions</option>
      <option value="North">North</option>
      <option value="South">South</option>
      <option value="East">East</option>
      <option value="West">West</option>
      <option value="Central">Central</option>
    </select>
  );
}
