export default function unitCalculation(value: any, valueRound: Boolean = false) {
    // console.log("valie", value)
    // console.log("valueRound", valueRound)
      if (value < 1.0e+3 && value >= 0  || value > -1.0e+3 && value < 0) {
        let result: any = Number(value).toFixed(2);
        if (valueRound) {
          result = Math.round(Number(result)).toString();
        }
        return result;
      } 
      else if (value < 1.0e+6 && value >= 0  || value > -1.0e+6 && value < 0) {
        // console.log(value)
        let result: any = (Number(value) / 1.0e+3).toFixed(2);
        if (valueRound) {
          result = Math.round(Number(result)).toString();
        }
        // console.log("K", result + "K")
        return result + "K";
        
      } 
      else if (value < 1.0e+9 && value >= 0 || value > -1.0e+9 && value < 0) {
        // console.log(value)
        let result: any = (Number(value) / 1.0e+6).toFixed(2);
        if (valueRound) {
          result = Math.round(Number(result)).toString();
        }
        // console.log("Million", result + "Mn")
        return result + "Mn";
      } 
      else {
        // console.log(value)
        let result: any = (Number(value) / 1.0e+9).toFixed(2);
        if (valueRound) {
          result = Math.round(Number(result)).toString();
        }
        // console.log("Billion", result + "Bn")
        return result + "Bn";
      }
  }