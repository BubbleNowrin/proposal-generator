export const proposalVariations = {
  openings: [
    "I noticed your project requires",
    "Your project caught my attention because",
    "I see you're looking for",
    "I've been working with similar projects and",
    "This project aligns perfectly with my expertise in",
    "I understand you need",
    "I'm excited to help you with"
  ],
  
  approaches: [
    "My approach would be to",
    "I would start by", 
    "Here's how I'd tackle this",
    "My strategy involves",
    "I plan to",
    "My methodology includes",
    "I'll begin with"
  ],
  
  closings: [
    "I'd love to discuss your specific requirements in detail.",
    "When would be a good time to discuss the project scope?",
    "I'm available to start immediately. Shall we schedule a quick call?",
    "I'd be happy to share more details about my approach.",
    "Let me know if you'd like to see examples of similar work.",
    "I'm ready to dive in. What questions do you have?",
    "Looking forward to helping you achieve your goals."
  ],
  
  structures: [
    {
      name: "problem-solution",
      template: "Problem identification → Solution approach → Deliverables → Timeline"
    },
    {
      name: "experience-first", 
      template: "Relevant experience → Understanding of needs → Proposed approach → Next steps"
    },
    {
      name: "direct",
      template: "Direct value proposition → Key benefits → Implementation plan → Call to action"
    }
  ]
}

export function getRandomVariation<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}