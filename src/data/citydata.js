export const cityData = {
  hyderabad: {
    id: "hyderabad",
    name: "Hyderabad",
    image:
      "https://www.bizzbuzz.news/h-upload/2024/07/10/1925951-hyderabad-is-4th-fastest-growing-city-in-the-world.webp",
    description:
      "Hyderabad, the capital of Telangana, is a major technology hub, known for Charminar, Golconda Fort, and Hyderabadi Biryani.",
    comingSoon: false,
    area: "650 km²",
    population: "10.5 Million",
    longitude: "78.4867° E",
    latitude: "17.3850° N",

    metrics: {
      overallComfort: { value: 12, status: "Crowded", color: "red" },
      temperature: { value: 29, humidity: 72, wind: 8 },
      airQuality: { value: 89, status: "Moderate", sky: "Clear Sky" },
      activeRoutes: { bus: 5, train: 4 },
      avgDelay: { value: 15, traffic: 60 }
    },

    transportModes: {
      bus: { label: "Bus", enabled: true },
      train: { label: "Train", enabled: true },
      metro: { label: "Metro", enabled: false },
      auto: { label: "Auto", enabled: false },
      twoWheeler: { label: "2-Wheeler", enabled: false }
    }
  },

  vellore: {
    id: "vellore",
    name: "Vellore",
    image:
      "https://d3sftlgbtusmnv.cloudfront.net/blog/wp-content/uploads/2024/12/Places-To-Visit-Near-Vellore-cp-840x425.jpg",
    description:
      "Vellore is known for the historic Vellore Fort and the prestigious CMC Hospital.",
    comingSoon: false,
    area: "87.92 km²",
    population: "500,000",
    longitude: "79.1333° E",
    latitude: "12.9165° N",

    metrics: {
      overallComfort: { value: 75, status: "Comfortable", color: "green" },
      temperature: { value: 32, humidity: 65, wind: 10 },
      airQuality: { value: 60, status: "Good", sky: "Sunny" },
      activeRoutes: { bus: 4, train: 2 },
      avgDelay: { value: 5, traffic: 20 }
    },

    transportModes: {
      bus: { label: "Bus", enabled: true },
      train: { label: "Train", enabled: true },
      auto: { label: "Auto", enabled: false },
      twoWheeler: { label: "2-Wheeler", enabled: false }
    }
  },

  tirupati: {
    id: "tirupati",
    name: "Tirupati",
    image:
      "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1ukFpa.img?w=749&h=421&m=6",
    description:
      "Tirupati is a major pilgrimage city, home to the Tirumala Venkateswara Temple.",
    comingSoon: false,
    area: "27.44 km²",
    population: "460,000",
    longitude: "79.4192° E",
    latitude: "13.6288° N",

    metrics: {
      overallComfort: { value: 45, status: "Moderate", color: "orange" },
      temperature: { value: 30, humidity: 70, wind: 7 },
      airQuality: { value: 75, status: "Moderate", sky: "Partly Cloudy" },
      activeRoutes: { bus: 6, train: 1 },
      avgDelay: { value: 10, traffic: 40 }
    },

    transportModes: {
      bus: { label: "Bus", enabled: true },
      train: { label: "Train", enabled: true },
      auto: { label: "Auto", enabled: false },
      twoWheeler: { label: "2-Wheeler", enabled: false }
    }
  },

  tiruvannamalai: {
    id: "tiruvannamalai",
    name: "Tiruvannamalai",
    image:
      "https://www.omspiritualshop.com/cdn/shop/articles/Thiruvannamalai_1024x1024.jpg?v=1731580457",
    description:
      "Tiruvannamalai is a spiritual town famous for the Arunachala Hill and Annamalaiyar Temple.",
    comingSoon: false,
    area: "16.36 km²",
    population: "150,000",
    longitude: "79.0747° E",
    latitude: "12.2258° N",

    metrics: {
      overallComfort: { value: 80, status: "Very Comfortable", color: "green" },
      temperature: { value: 28, humidity: 75, wind: 5 },
      airQuality: { value: 50, status: "Excellent", sky: "Clear" },
      activeRoutes: { bus: 3, train: 1 },
      avgDelay: { value: 3, traffic: 10 }
    },

    transportModes: {
      bus: { label: "Bus", enabled: true },
      train: { label: "Train", enabled: true },
      auto: { label: "Auto", enabled: false },
      twoWheeler: { label: "2-Wheeler", enabled: false }
    }
  },

  vijayawada: {
    id: "vijayawada",
    name: "Vijayawada",
    image:
      "https://i.ytimg.com/vi/_48cl14iawk/hqdefault.jpg",
    description:
      "Vijayawada is a commercial hub located on the banks of the Krishna River.",
    comingSoon: false,
    area: "61.88 km²",
    population: "1.2 Million",
    longitude: "80.6480° E",
    latitude: "16.5062° N",

    metrics: {
      overallComfort: { value: 60, status: "Good", color: "blue" },
      temperature: { value: 31, humidity: 68, wind: 9 },
      airQuality: { value: 65, status: "Good", sky: "Clear" },
      activeRoutes: { bus: 6, train: 2 },
      avgDelay: { value: 8, traffic: 30 }
    },

    transportModes: {
      bus: { label: "Bus", enabled: true },
      train: { label: "Train", enabled: true },
      auto: { label: "Auto", enabled: false },
      twoWheeler: { label: "2-Wheeler", enabled: false }
    }
  },

  // ---------------- COMING SOON CITIES ----------------

  chennai: {
    id: "chennai",
    name: "Chennai",
    image:
      "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/1765681589chennai-1696645169332.jpg",
    description:
      "Chennai is a major cultural and economic center of South India.",
    comingSoon: true
  },

  bangalore: {
    id: "bangalore",
    name: "Bangalore",
    image:
      "https://www.agoda.com/wp-content/uploads/2024/01/Featured-image-The-Vidhana-Soudha-in-Bangalore.jpg",
    description:
      "Bangalore is India's Silicon Valley and a major IT hub.",
    comingSoon: true
  },

  delhi: {
    id: "delhi",
    name: "Delhi",
    image:
      "https://s7ap1.scene7.com/is/image/incredibleindia/red-fort-delhi1-attr-hero",
    description:
      "Delhi is India’s capital, rich in history and modern infrastructure.",
    comingSoon: true
  },

  ahmedabad: {
    id: "ahmedabad",
    name: "Ahmedabad",
    image:
      "https://i.ytimg.com/vi/xdZFacSYPBE/maxresdefault.jpg",
    description:
      "Ahmedabad is a UNESCO World Heritage City in Gujarat.",
    comingSoon: true
  },

  trivandrum: {
    id: "trivandrum",
    name: "Trivandrum",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Padmanabhaswamy_Temple_Thiruvananthapuram.jpg/1200px-Padmanabhaswamy_Temple_Thiruvananthapuram.jpg",
    description:
      "Trivandrum is the capital of Kerala, known for beaches and temples.",
    comingSoon: true
  }
};
