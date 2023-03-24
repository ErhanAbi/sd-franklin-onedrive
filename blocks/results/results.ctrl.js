function convertExcelDateToJSDate(excelDate) {
  excelDate = typeof excelDate === "string" ? parseFloat(excelDate) : excelDate;
  const offset = 25569; // 1/1/1970 in excel terms
  const utcDays = Math.floor(excelDate - offset);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);

  const fractionalDay = excelDate - Math.floor(excelDate) + 0.0000001;

  let totalSecs = Math.floor(86400 * fractionalDay);
  const seconds = totalSecs % 60;
  totalSecs -= seconds;

  const hours = Math.floor(totalSecs / (60 * 60));
  const minutes = Math.floor(totalSecs / 60) % 60;

  return new Date(
    dateInfo.getFullYear(),
    dateInfo.getMonth(),
    dateInfo.getDate(),
    hours,
    minutes,
    seconds
  );
}

export class ResultsController {
  host;
  data = null;

  constructor(host, path) {
    (this.host = host).addController(this);
    this.path = path;
  }

  async fillWithData() {
    const req = await fetch(this.path);
    this.data = await req.json();
    if (req.ok) {
      this.data.data = this.data.data.map((row) => ({
        ...row,
        datePublished: convertExcelDateToJSDate(row.datePublished),
      }));
    }
    this.host.requestUpdate();
  }

  hostConnected() {
    // Start a timer when the host is connected
    this.fillWithData();
    // this._timerID = setInterval(() => {
    //   this.value = new Date();
    //   // Update the host with new value
    //   this.host.requestUpdate();
    // }, this.timeout);
  }
}
