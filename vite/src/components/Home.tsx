import { FormEvent, useEffect, useState } from 'react'
import {
  OpenAIClient,
  AzureKeyCredential,
  ChatRequestMessage,
  FunctionCall,
  GetChatCompletionsOptions,
} from '@azure/openai'
import { callFunction } from '../functions/call_function'
import { TOOLS } from '../lib/tools'
import { OpenAIClientOptions } from '@azure/openai/types/src'
import { tokenState } from '../atoms/tokenState'
import { useRecoilState, useSetRecoilState } from 'recoil'

const clientOptions: OpenAIClientOptions = { apiVersion: "2023-12-01-preview" }

const client = new OpenAIClient(
  import.meta.env.VITE_AZURE_URL,
  new AzureKeyCredential(import.meta.env.VITE_AZURE_API_KEY),
  clientOptions
)
const deploymentId = 'gpt-4-turbo'

const options: GetChatCompletionsOptions = { 
  tools: TOOLS
}

export const Home = () => {
  const [input, setInput] = useState('')
  const [inputToken, setInputToken] = useState('')
  const [chatList, setChatList] = useState<ChatRequestMessage[] | []>([])
  const [token, setToken] = useRecoilState(tokenState)

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newMessages: ChatRequestMessage[] = [
      ...chatList,
      { role: 'user', content: input },
    ]
    setChatList(newMessages)
    setInput('')
    await callChat(newMessages)
  }

  const callChat = async (messages: ChatRequestMessage[]) => {
    const events = await client.getChatCompletions(
      deploymentId,
      messages,
      options,
    )
    console.log("client")
    console.log(client)
    handleResponse(events)

    async function handleResponse(response: any) {
      const tool_response_messages: any[] = [];

      if (response.choices[0].message.tool_calls !== null) {
        const tool_calls = response.choices[0].message.toolCalls;
        console.log(response.choices[0].message)

        for (const tool_call of tool_calls) {
          if (tool_call.type === "function") {
            const function_call = tool_call.function;
            const function_name = function_call.name;
            
            const available_functions = TOOLS.map(tool => tool.function.name);
            
            if (available_functions.includes(function_name)) {
              const args: FunctionCall = tool_call.function
              const function_response = await callFunction(token, args)
              tool_response_messages.push({
                "tool_call_id": tool_call.id,
                "role": "tool",
                "content": function_response,
              });
            } else {
              console.error(`関数名：${function_name}`);
              throw new Error("関数名が利用可能な関数と一致しません");
            }
          }
        }
      } else {
        console.log("関数は呼び出されませんでした");
      }

      const history_messages = [
        {"role": "user", "content": input},
        response.choices[0].message,
        ...tool_response_messages
      ];
      console.log(history_messages)
      const second_response = await client.getChatCompletions(
        deploymentId,
        history_messages,
        options
      );
      console.log(second_response)
      const responseMessage = second_response.choices[0].message
      const message = {
        role: 'function',
        content: JSON.stringify(responseMessage!.content),
      }
      const newMessages = [...messages, responseMessage as ChatRequestMessage]
      setChatList(newMessages)
      if (responseMessage?.functionCall) {
        const functionResponseMessage = message
        const afterFunctioncallMessages = [
          ...newMessages,
          functionResponseMessage as ChatRequestMessage,
        ]
        setChatList(afterFunctioncallMessages)
        callChat(afterFunctioncallMessages)
      }
      console.log(newMessages)
    }
  }

  const onSubmitToken = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setToken(inputToken);
    setInputToken('')
  };

  useEffect(() => {
    console.log(token)
  }, [onSubmitToken])

  return (
    <>
      {/* <input
          type='text'
          value={input}
          className='grow bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5'
          onChange={(e) => setToken(e.target.value)}
        /> */}
      <form 
        className='m-3 flex flex-row gap-1 '
        onSubmit={(e) => onSubmitToken(e)}
      >
        <input
          type='text'
          value={inputToken}
          className='grow bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5'
          onChange={(e) => setInputToken(e.target.value)}
        />
        <button 
          type='submit'
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg p-2.5'
        >Save Token</button>
      </form>
      <div className='m-3 gap-1 flex flex-col'>
        {chatList.map((chat, index) => {
          let content = ''
          let addClass = ''
          content = String(chat.content)
          if (!chat.content) return ''
          if (chat.role === 'function') return ''
          if (chat.role === 'user') addClass += ' ml-auto mr-0'
          return (
            <p
              key={index}
              className={
                'whitespace-pre-wrap break-all border border-gray-300 text-gray-900 rounded-lg p-2.5 w-fit' +
                addClass
              }
            >
              {content}
            </p>
          )
        })}
      </div>
      <form
        onSubmit={(e) => onSubmitHandler(e)}
        className='m-3 flex flex-row gap-1 '
      >
        <input
          type='text'
          value={input}
          className='grow bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5'
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type='submit'
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg p-2.5'
        >
          送信
        </button>
      </form>
    </>
  )
}
