export default function TimeZone() {

    const regex: RegExp = /\(([^)]+)\)/;
    const inputDate: Date = new Date();
    const inputString: string = inputDate.toString();
    const match: RegExpExecArray | null = regex.exec(inputString);
    let textInsideBrackets: string = "";
    if (match !== null) {
        textInsideBrackets = match[0];
    }

    return textInsideBrackets
}