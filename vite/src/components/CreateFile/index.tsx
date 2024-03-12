import { FormEvent, useState } from "react"
import {
  OpenAIClient,
  AzureKeyCredential,
  ChatRequestMessage,
  FunctionCall,
  GetChatCompletionsOptions,
} from "@azure/openai"
import { callFunction } from "../../functions/call_function"
import { TOOLS } from "../../lib/tools"
import { OpenAIClientOptions } from "@azure/openai/types/src"
import { tokenState } from "../../atoms/tokenState"
import { useRecoilState } from "recoil"
import { Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { Toast } from "../../util/toast"

const clientOptions: OpenAIClientOptions = { apiVersion: "2023-12-01-preview" }

const client = new OpenAIClient(
  import.meta.env.VITE_AZURE_URL,
  new AzureKeyCredential(import.meta.env.VITE_AZURE_API_KEY),
  clientOptions
)
// const deploymentId = 'gpt-4-turbo' // 4だとcallするときに日本語が文字化けするっぽい
const deploymentId = "gpt-35-turbo-1106"

const options: GetChatCompletionsOptions = {
  tools: [TOOLS[8]], // ファイル作成関数指定
}

export const CreateFile = () => {
  const [input, setInput] = useState("")
  const [inputToken, setInputToken] = useState("")
  const [projectName, setProjectName] = useState("")
  const [fileContent, setFileContent] = useState("")
  const [filePath, setFilePath] = useState("")
  const [branch, setBranch] = useState("")
  const [commitMessage, setCommitMessage] = useState("")
  const [chatList, setChatList] = useState<ChatRequestMessage[] | []>([])
  const [token, setToken] = useRecoilState(tokenState)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(3)

  const inputSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newInput = `
      「${projectName}」というプロジェクトの「${branch}」ブランチに「${filePath}」というファイルを作成してください。
      「${commitMessage}」というコミットメッセージで作成してください。
      また、ファイルの内容は以下です。
        ${fileContent}
    `
    console.log(newInput)
    console.log(commitMessage)
    setInput(newInput)
    onSubmitHandler(newInput)
  }

  const onSubmitHandler = async (input: string) => {
    const newMessages: ChatRequestMessage[] = [{ role: "user", content: input }]
    console.log(newMessages)
    setChatList(newMessages)
    setInput("")
    await callChat(newMessages)
  }

  const callChat = async (messages: ChatRequestMessage[]) => {
    if (!token) {
      Toast.fire({
        title: "認証エラー：トークンを保存してください。",
        icon: "warning",
      })
      throw new Error("トークンないよエラー")
    }
    const events = await client.getChatCompletions(
      deploymentId,
      messages,
      options
    )
    handleResponse(events)

    async function handleResponse(response: any) {
      const tool_response_messages: any[] = []

      if (response.choices[0].message.tool_calls !== null) {
        const tool_calls = response.choices[0].message.toolCalls
        console.log(response.choices[0].message)

        for (const tool_call of tool_calls) {
          if (tool_call.type === "function") {
            const function_call = tool_call.function
            const function_name = function_call.name

            const available_functions = TOOLS.map((tool) => tool.function.name)

            if (available_functions.includes(function_name)) {
              const args: FunctionCall = tool_call.function
              const function_response = await callFunction(
                token,
                args,
                page,
                perPage
              )
              tool_response_messages.push({
                tool_call_id: tool_call.id,
                role: "tool",
                content: function_response,
              })
            } else {
              console.error(`関数名：${function_name}`)
              throw new Error("関数名が利用可能な関数と一致しません")
            }
          }
        }
      } else {
        console.log("関数は呼び出されませんでした")
      }

      const history_messages = [
        { role: "user", content: input },
        response.choices[0].message,
        ...tool_response_messages,
      ]
      console.log(history_messages)
      const second_response = await client.getChatCompletions(
        deploymentId,
        history_messages,
        options
      )
      console.log(second_response)
      const responseMessage = second_response.choices[0].message
      const message = {
        role: "function",
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
    e.preventDefault()
    setToken(inputToken)
    setInputToken("")
  }

  return (
    <>
      <div className="bg-slate-100">
        <div className="container mx-4">
          <Link to={"/"} className="mb-4 inline-block">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Home
            </button>
          </Link>
          <Link to={"/updateFile"} className="mb-4 ml-2 inline-block">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              ファイル編集
            </button>
          </Link>
          <p>ファイル新規作成</p>
        </div>
        <form
          className="m-3 flex flex-row gap-1 "
          onSubmit={(e) => onSubmitToken(e)}
        >
          <input
            type="text"
            value={inputToken}
            className="grow bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5"
            onChange={(e) => setInputToken(e.target.value)}
          />
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg p-2.5"
          >
            トークン保存
          </button>
        </form>
        <form
          onSubmit={(e) => inputSubmitHandler(e)}
          className="m-3 flex flex-col gap-1 "
        >
          <div className="mb-4">
            <label htmlFor="projectName" className="block text-gray-700">
              プロジェクトの名前
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="branch" className="block text-gray-700">
              ブランチ名
            </label>
            <input
              type="text"
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="commitMessage" className="block text-gray-700">
              コミットメッセージ
            </label>
            <input
              type="text"
              id="commitMessage"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="filePath" className="block text-gray-700">
              ファイルパス
            </label>
            <input
              type="text"
              id="filePath"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="fileContent" className="block text-gray-700">
              ファイルの内容
            </label>
            <textarea
              id="fileContent"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
              rows={5}
            ></textarea>
          </div>
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg p-2.5"
          >
            作成してpush
          </button>
        </form>
        <div className="m-3 mt-16 gap-1 flex flex-col">
          <p>-------------------GPT回答↓-------------------</p>
          {chatList.map((chat, index) => {
            let content = ""
            let addClass = ""
            content = String(chat.content)
            if (!chat.content) return ""
            if (chat.role === "function") return ""
            if (chat.role === "user") return ""
            return (
              <ReactMarkdown
                key={index}
                className={
                  "whitespace-pre-wrap break-all border bg-gray-50 border-gray-300 text-gray-900 rounded-lg p-2.5 w-fit" +
                  addClass
                }
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} className="text-blue-500 underline" />
                  ),
                }}
                children={content}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}
