export default function unitCalculation(value: any, valueRound: Boolean = false) {
  if (value < 1.0e+3 && value >= 0 || value > -1.0e+3 && value < 0) {
    let result: any = Number(value).toFixed(2);
    if (valueRound) {
      result = Math.round(Number(result)).toString();
    }
    return result;
  }
  else if (value < 1.0e+6 && value >= 0 || value > -1.0e+6 && value < 0) {
    let result: any = (Number(value) / 1.0e+3).toFixed(2);
    if (valueRound) {
      result = Math.round(Number(result)).toString();
    }
    return result + "K";

  }
  else if (value < 1.0e+9 && value >= 0 || value > -1.0e+9 && value < 0) {
    let result: any = (Number(value) / 1.0e+6).toFixed(2);
    if (valueRound) {
      result = Math.round(Number(result)).toString();
    }
    return result + "Mn";
  }
  else {
    let result: any = (Number(value) / 1.0e+9).toFixed(2);
    if (valueRound) {
      result = Math.round(Number(result)).toString();
    }
    return result + "Bn";
  }
}