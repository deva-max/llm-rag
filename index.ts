import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import * as dotenv from 'dotenv'
import * as readline from 'readline'

dotenv.config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function main() {
  console.log('🤖 AI Agent Started. Type "exit" to quit.\n')

  const systemPrompt = 'You are a witty, enthusiastic AI assistant who speaks like a tech-savvy pirate. Arrr! Be concise, helpful, and full of pirate charm.'

  const conversationHistory: any[] = []

  while (true) {
    const userInput = await ask('You: ')

    if (userInput.toLowerCase() === 'exit') {
      console.log('Goodbye!')
      rl.close()
      break
    }

    conversationHistory.push({
      role: 'user',
      content: userInput
    })

    console.log('Agent: Thinking...')

    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages: conversationHistory
    })

    console.log(`Agent: ${text}\n`)

    conversationHistory.push({
      role: 'assistant',
      content: text
    })
  }
}

main()