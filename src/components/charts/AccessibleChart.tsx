export interface AccessiblePlanetRow {
  planet: string;
  sign: string;
  house: number;
  degree: number;
}

export const AccessibleChart = ({
  name,
  planets,
}: {
  name?: string;
  planets: AccessiblePlanetRow[];
}) => (
  <div role="img" aria-label={name ? `Natal chart for ${name}` : 'Natal chart planetary positions'}>
    <table className="sr-only">
      <caption>Birth Chart Planetary Positions</caption>
      <thead>
        <tr>
          <th>Planet</th>
          <th>Sign</th>
          <th>House</th>
          <th>Degree</th>
        </tr>
      </thead>
      <tbody>
        {planets.map((row) => (
          <tr key={`${row.planet}-${row.house}`}>
            <td>{row.planet}</td>
            <td>{row.sign}</td>
            <td>{row.house}</td>
            <td>{row.degree.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div aria-live="polite" className="sr-only" id="chart-announcements" />
  </div>
);
