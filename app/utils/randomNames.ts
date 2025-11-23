// Generate random usernames for anonymous posting
const adjectives = [
  'Curious', 'Clever', 'Bright', 'Swift', 'Bold', 'Wise', 'Creative', 'Stellar',
  'Dynamic', 'Brilliant', 'Elegant', 'Fierce', 'Gentle', 'Happy', 'Inspiring',
  'Joyful', 'Kind', 'Lively', 'Mighty', 'Noble', 'Optimistic', 'Peaceful',
  'Radiant', 'Serene', 'Thoughtful', 'Vibrant', 'Wonderful', 'Zealous'
]

const nouns = [
  'Coder', 'Developer', 'Programmer', 'Builder', 'Creator', 'Maker', 'Innovator',
  'Designer', 'Architect', 'Engineer', 'Analyst', 'Specialist', 'Expert',
  'Ninja', 'Wizard', 'Guru', 'Master', 'Pro', 'Ace', 'Champion', 'Hero',
  'Pioneer', 'Explorer', 'Adventurer', 'Seeker', 'Learner', 'Student', 'Scholar'
]

const animals = [
  'Fox', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Panda', 'Owl', 'Hawk', 'Bear',
  'Dolphin', 'Whale', 'Shark', 'Falcon', 'Phoenix', 'Dragon', 'Unicorn',
  'Butterfly', 'Hummingbird', 'Cheetah', 'Jaguar', 'Lynx', 'Raven', 'Swan'
]

export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = Math.random() > 0.5 
    ? nouns[Math.floor(Math.random() * nouns.length)]
    : animals[Math.floor(Math.random() * animals.length)]
  
  const number = Math.floor(Math.random() * 999) + 1
  
  return `${adjective}${noun}${number}`
}