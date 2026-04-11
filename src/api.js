// API functions for the public transport app

export async function getStates() {
  // Mock data - replace with actual API call
  return ["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu"];
}

export async function getCities(state) {
  // Mock data - replace with actual API call
  const citiesByState = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"]
  };
  return citiesByState[state] || [];
}

export async function getBuses(src, dst) {
  // Mock data - replace with actual API call
  const seats = Array.from({ length: 22 }, (_, i) => i + 1);
  return [
    {
      id: 1,
      name: "Express Bus",
      time: "10:00 AM",
      safety_score: 85,
      seats: seats
    },
    {
      id: 2,
      name: "Luxury Bus",
      time: "2:00 PM",
      safety_score: 92,
      seats: seats
    },
    {
      id: 3,
      name: "Standard Bus",
      time: "6:00 PM",
      safety_score: 78,
      seats: seats
    }
  ];
}

export async function bookTicket({ bus_id, seats }) {
  // Mock API call - replace with actual API call
  console.log("Booking ticket:", { bus_id, seats });
  return { success: true };
}

export async function askGemini(message) {
  // Mock API call - replace with actual Gemini API call
  // This should call Google's Gemini API
  const mockResponses = {
    "safety": "Our buses are equipped with GPS tracking, emergency buttons, and regular safety inspections.",
    "schedule": "Buses run every 30 minutes during peak hours and every hour during off-peak hours.",
    "booking": "You can book tickets online or at the bus station. Online bookings are recommended."
  };
  
  const lowerMsg = message.toLowerCase();
  for (const [key, response] of Object.entries(mockResponses)) {
    if (lowerMsg.includes(key)) {
      return { reply: response };
    }
  }
  
  return { 
    reply: "I'm here to help with safety-related questions about public transport. Please ask about safety, schedules, or booking." 
  };
}
