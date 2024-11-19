
export function generateOTP() {
  
//   const length = config.get("EmailService.OtpLength");  //LINES ARE WAITING CONFIG FILE CHECK
  const length = 6
  const chars = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = getRandomInt(0, chars.length);
    otp += chars[randomIndex];
  }

  return otp;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function addMinutes(dateValue: Date, minutes: number) {
  const date = new Date(dateValue);
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}