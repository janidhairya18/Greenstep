import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface GeneratedRecommendation {
  recommendationType: string;
  content: string;
  impactLevel: string;
  savedCo2Est: number;
}

export async function generateActionPlan(
  transportation: string,
  electricityUsage: string,
  foodHabits: string,
  wasteManagement: string,
  lifestyle: string,
  carbonScore: number,
  co2Emissions: number
): Promise<GeneratedRecommendation[]> {
  if (!ai) {
    console.warn("Gemini API key is not configured. Falling back to default suggestions.");
    return getDefaultRecommendations(transportation, foodHabits);
  }

  try {
    const prompt = `You are GreenStep AI, an expert sustainability coach. Based on the user's carbon footprint profile, analyze their lifestyle and provide exactly 3 highly actionable, specific recommendations to reduce their carbon emissions.

User Profile:
- Carbon Score: ${carbonScore}/1000
- Annual Footprint: ${co2Emissions} kg CO₂
- Private/Public Transportation Habit: ${transportation}
- Home Electricity Level: ${electricityUsage}
- Primary Food Choices: ${foodHabits}
- Waste & Recycling Habit: ${wasteManagement}
- Lifestyle & Consumption Level: ${lifestyle}

Provide your recommendations in clean JSON format matching the schema requested. The recommendations should directly target the user's highest emission categories (e.g. if they drive a petrol car, advise electric transitions or public transit; if they eat heavy meat, suggest veggie targets; if they waste electricity, direct energy conservation, etc.).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              recommendationType: {
                type: Type.STRING,
                description: "The primary category of this recommendation, i.e., Transport, Food, Energy, Waste, or Lifestyle",
              },
              content: {
                type: Type.STRING,
                description: "The detailed, human, and encouraging sentence guiding this specific climate action.",
              },
              impactLevel: {
                type: Type.STRING,
                description: "High, Medium, or Low",
              },
              savedCo2Est: {
                type: Type.NUMBER,
                description: "Estimated annual CO₂ savings in kg.",
              },
            },
            required: ["recommendationType", "content", "impactLevel", "savedCo2Est"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return parsed;
  } catch (error) {
    console.error("Failed to generate AI recommendations:", error);
    return getDefaultRecommendations(transportation, foodHabits);
  }
}

function getDefaultRecommendations(transportation: string, foodHabits: string): GeneratedRecommendation[] {
  const recommendations: GeneratedRecommendation[] = [
    {
      recommendationType: "Energy",
      content: "Install LED lighting and unplug vampire/phantom appliances when turning off devices.",
      impactLevel: "Medium",
      savedCo2Est: 120,
    },
  ];

  if (transportation.toLowerCase() === 'petrol car') {
    recommendations.push({
      recommendationType: "Transport",
      content: "Commit to using public transit or green carpooling at least 2 days a week to cut urban vehicle emissions.",
      impactLevel: "High",
      savedCo2Est: 450,
    });
  } else {
    recommendations.push({
      recommendationType: "Transport",
      content: "Ensure tires are properly inflated and maintain a steady velocity to maximize commuting energy efficiency.",
      impactLevel: "Low",
      savedCo2Est: 50,
    });
  }

  if (foodHabits.toLowerCase() === 'heavy meat eater' || foodHabits.toLowerCase() === 'flexitarian') {
    recommendations.push({
      recommendationType: "Food",
      content: "Establish a meat-free target of 2 vegetarian days per week to substantially chip away at farming emissions.",
      impactLevel: "High",
      savedCo2Est: 310,
    });
  } else {
    recommendations.push({
      recommendationType: "Food",
      content: "Reduce domestic food kitchen waste by carefully organizing portions and composting organic remains.",
      impactLevel: "Medium",
      savedCo2Est: 95,
    });
  }

  return recommendations;
}
