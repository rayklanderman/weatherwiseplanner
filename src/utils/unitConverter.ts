export const kelvinToCelsius = (kelvin: number): number => kelvin - 273.15;

export const kelvinToFahrenheit = (kelvin: number): number =>
  (kelvinToCelsius(kelvin) * 9) / 5 + 32;

export const precipitationRateToMmPerDay = (kgPerSquareMeterPerSecond: number): number =>
  kgPerSquareMeterPerSecond * 86400;

export const metersPerSecondToKilometersPerHour = (metersPerSecond: number): number =>
  metersPerSecond * 3.6;

export const heatIndex = (temperatureCelsius: number, relativeHumidity: number): number => {
  const temperatureFahrenheit = temperatureCelsius * 1.8 + 32;
  const hi =
    -42.379 +
    2.04901523 * temperatureFahrenheit +
    10.14333127 * relativeHumidity -
    0.22475541 * temperatureFahrenheit * relativeHumidity -
    6.83783e-3 * temperatureFahrenheit ** 2 -
    5.481717e-2 * relativeHumidity ** 2 +
    1.22874e-3 * temperatureFahrenheit ** 2 * relativeHumidity +
    8.5282e-4 * temperatureFahrenheit * relativeHumidity ** 2 -
    1.99e-6 * temperatureFahrenheit ** 2 * relativeHumidity ** 2;

  return ((hi - 32) * 5) / 9;
};
