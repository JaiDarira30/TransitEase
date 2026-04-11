export const stationData = {
  "hyderabad-kcg": {
    name: "Hyderabad Deccan (KCG)",
    trains: [
      {
        name: "Venkatadri Express",
        number: "12797",
        route: "Kacheguda → Tirupati",
        schedule: { arrival: "06:00 AM", departure: "06:10 AM" },
        liveStatus: {
          estimatedArrival: "06:05 AM",
          estimatedDeparture: "06:15 AM",
          delay: "5 min"
        }
      },
      {
        name: "Charminar Express",
        number: "12759",
        route: "Hyderabad → Chennai",
        schedule: { arrival: "07:30 AM", departure: "07:40 AM" },
        liveStatus: {
          estimatedArrival: "07:30 AM",
          estimatedDeparture: "07:40 AM",
          delay: "On Time"
        }
      }
    ]
  },

  "tirupati-tpty": {
    name: "Tirupati (TPTY)",
    trains: [
      {
        name: "Venkatadri Express",
        number: "12798",
        route: "Tirupati → Kacheguda",
        schedule: { arrival: "05:00 PM", departure: "05:10 PM" },
        liveStatus: {
          estimatedArrival: "05:15 PM",
          estimatedDeparture: "05:25 PM",
          delay: "15 min"
        }
      }
    ]
  },

  "vellore-vlr": {
    name: "Katpadi Junction (KPD)",
    trains: [
      {
        name: "Yelagiri Express",
        number: "16089",
        route: "Katpadi → Chennai",
        schedule: { arrival: "08:15 AM", departure: "08:20 AM" },
        liveStatus: {
          estimatedArrival: "08:15 AM",
          estimatedDeparture: "08:20 AM",
          delay: "On Time"
        }
      }
    ]
  },

  "vijayawada-bza": {
    name: "Vijayawada Junction (BZA)",
    trains: [
      {
        name: "Godavari Express",
        number: "12727",
        route: "Vijayawada → Hyderabad",
        schedule: { arrival: "03:00 PM", departure: "03:15 PM" },
        liveStatus: {
          estimatedArrival: "03:05 PM",
          estimatedDeparture: "03:20 PM",
          delay: "5 min"
        }
      }
    ]
  },

  "tiruvannamalai-tnm": {
    name: "Tiruvannamalai (TNM)",
    trains: [
      {
        name: "Tiruvannamalai Express",
        number: "16115",
        route: "Tiruvannamalai → Chennai",
        schedule: { arrival: "07:00 AM", departure: "07:05 AM" },
        liveStatus: {
          estimatedArrival: "07:00 AM",
          estimatedDeparture: "07:05 AM",
          delay: "On Time"
        }
      }
    ]
  }
};
