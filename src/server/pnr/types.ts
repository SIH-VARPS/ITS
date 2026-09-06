export type PnrSource = "railradar" | "demo";

export type PnrStatus = {
  pnr: string;
  trainNumber: string;
  trainName: string;
  fromStation: { code: string; name: string };
  toStation: { code: string; name: string };
  boardingStation: { code: string; name: string };
  journeyDate: string;
  bookingClass: string;
  quota: string;
  chartStatus: "CHART PREPARED" | "CHART NOT PREPARED";
  passengers: {
    number: number;
    bookingStatus: string;
    currentStatus: string;
    coach: string;
    berth: number;
    berthType: "Lower" | "Middle" | "Upper" | "Side Lower" | "Side Upper" | "Window" | "Aisle";
  }[];
  fare: number;
  liveStatus: {
    speed: number;
    delay: number;
    nextStation: string;
    eta: string;
  };
  source: PnrSource;
};

export type PnrLookupResult =
  | { ok: true; data: PnrStatus }
  | { ok: false; status: 400 | 404; message: string };
