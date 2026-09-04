export type Train = {
  number: string;
  name: string;
  from: string;
  to: string;
  speed: number;
  delay: number;
  nextStation: string;
  eta: string;
  progress: number;
  type: string;
};

export const quickServices = [
  {
    title: "Station Board",
    description: "Live arrivals, departures and platform assignments",
    icon: "board",
  },
  {
    title: "Connecting Impact",
    description: "How a delayed arrival affects seat status on connecting services",
    icon: "seat",
  },
] as const;

export const features = [
  {
    title: "Schedule-backed ETA",
    body: "Every arrival starts from the published timetable, then applies the current delay and remaining slack so the number you see is a forecast, not a copied clock.",
  },
  {
    title: "Delay window, not a single guess",
    body: "When the model runs it also reports a confidence score and an arrival window, so a control room can plan around uncertainty instead of a false precision.",
  },
  {
    title: "Delay cause tags",
    body: "Late trains are labelled with a classified cause — weather, congestion, track work, signal or technical — derived from the same feature vector as the ETA.",
  },
  {
    title: "Control-room dashboard",
    body: "A monitored-subset view of running trains, active delay alerts and the cause breakdown for operations staff.",
  },
  {
    title: "Trains between stations",
    body: "Direct services linking two stations, with halt order and running days taken from the ingested timetable.",
  },
  {
    title: "Developer REST API",
    body: "Predicted ETA, delay causes, confidence intervals, station boards and timetables on documented JSON endpoints.",
  },
];

export const stations = [
  ["New Delhi", "NDLS"],
  ["Howrah Junction", "HWH"],
  ["Mumbai Central", "MMCT"],
  ["Mumbai CSMT", "CSMT"],
  ["KSR Bengaluru", "SBC"],
  ["Chennai Central", "MAS"],
  ["Patna Junction", "PNBE"],
  ["Pune Junction", "PUNE"],
  ["Secunderabad", "SC"],
  ["Ahmedabad", "ADI"],
  ["Jaipur Junction", "JP"],
  ["Lucknow Charbagh", "LKO"],
  ["Bhopal Junction", "BPL"],
  ["Kanpur Central", "CNB"],
  ["Nagpur Junction", "NGP"],
  ["Prayagraj Junction", "PRYJ"],
];

export const faqs = [
  {
    q: "How do I see where my train is right now?",
    a: "Type the five digit train number or its name into the live status box. The map centres on the train and shows current speed, running delay and the next scheduled halt with its platform.",
  },
  {
    q: "How are arrival times predicted?",
    a: "The baseline is the published arrival plus the current delay minus remaining schedule slack. The ETA model then layers historical halt drift, corridor congestion and time of day, and reports a confidence window instead of a single optimistic number.",
  },
  {
    q: "Why are some trains showing a delay cause?",
    a: "When a train is running late, the model classifies the most likely cause — weather, track congestion, planned track work, a signal failure or a technical issue — so staff can respond to the right problem.",
  },
  {
    q: "How does a delay affect my connecting train?",
    a: "The connecting-impact view shows whether your onward service is at risk and how crowded or available a later connection is likely to be, based on the predicted arrival of your incoming train.",
  },
  {
    q: "Can I use the data in my own product?",
    a: "Yes. The REST API exposes predicted ETA, delay causes, confidence intervals, live positions, timetables and halt coordinates. Open the developer page for the current endpoint list — there is no advertised monthly quota until a limiter is actually wired up.",
  },
];
