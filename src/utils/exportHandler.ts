import { WeatherQueryResponse } from "../types/weather";

const downloadFile = (data: BlobPart, filename: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const exportAsJSON = (payload: WeatherQueryResponse) => {
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `weatherwise_${payload.query.date_of_year.replace("-", "")}_${timestamp}.json`;
  downloadFile(JSON.stringify(payload, null, 2), filename, "application/json");
};

export const exportAsCSV = (payload: WeatherQueryResponse) => {
  const { query, results, metadata } = payload;
  const header = [
    "condition",
    "probability_percent",
    "threshold_value",
    "threshold_unit",
    "trend",
    "historical_values"
  ];

  const rows = Object.entries(results)
    .map(([key, value]) => {
      if (!value) return null;
      return [
        key,
        value.probability_percent,
        value.threshold.value,
        value.threshold.unit,
        value.trend ?? "",
        `"${value.historical_values.join(";")}"`
      ].join(",");
    })
    .filter(Boolean);

  const metadataLines = [
    "",
    `source,${metadata.data_source}`,
    `time_range,${metadata.time_range}`,
    `units,${metadata.units}`,
    `generated_at,${metadata.generated_at}`,
    `query_location_lat,${query.location.lat}`,
    `query_location_lon,${query.location.lon}`,
    `query_date_of_year,${query.date_of_year}`
  ];

  const csvContent = [header.join(","), ...(rows as string[]), ...metadataLines].join("\n");
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `weatherwise_${query.date_of_year.replace("-", "")}_${timestamp}.csv`;
  downloadFile(csvContent, filename, "text/csv");
};
