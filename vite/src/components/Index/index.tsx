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
  tools: [TOOLS[0], TOOLS[2], TOOLS[4]], // 一覧関数指定
}

export const Index = () => {
  const [input, setInput] = useState("")
  const [inputToken, setInputToken] = useState("")
  const [branchProjectName, setBranchProjectName] = useState("")
  const [mrProjectName, setMrProjectName] = useState("")
  const [commitProjectName, setCommitProjectName] = useState("")
  const [branch, setBranch] = useState("")
  const [chatList, setChatList] = useState<ChatRequestMessage[] | []>([])
  const [token, setToken] = useRecoilState(tokenState)
  const [branchPage, setBranchPage] = useState(1)
  const [branchPerPage, setBranchPerPage] = useState(3)
  const [mrPage, setMrPage] = useState(1)
  const [mrPerPage, setMrPerPage] = useState(3)
  const [commitPage, setCommitPage] = useState(1)
  const [commitPerPage, setCommitPerPage] = useState(3)

  const branchSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newInput = `
    「${branchProjectName}」というプロジェクトのブランチ一覧を見せてください。
    `
    setInput(newInput)
    onSubmitHandler(newInput)
  }
  const mrSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newInput = `
    「${mrProjectName}」というプロジェクトのマージリクエスト一覧を見せてください。
    `
    setInput(newInput)
    onSubmitHandler(newInput)
  }
  const commitSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newInput = `
    「${commitProjectName}」というプロジェクトの「${branch}」ブランチのコミット一覧を見せてください。
    `
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
    if (!inputToken) {
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
              let page = 0
              let perPage = 0
              const args: FunctionCall = tool_call.function
              switch (function_name) {
                case "listBranches":
                  page = branchPage
                  perPage = branchPerPage
                  break
                case "getMergeRequests":
                  page = mrPage
                  perPage = mrPerPage
                  break
                case "listCommits":
                  page = commitPage
                  perPage = commitPerPage
                  break
                default:
                  console.error(`関数名：${function_name}`)
                  throw new Error("関数名が利用可能な関数と一致しません")
              }
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
        { role: "system", content: "日本語で回答します。" },
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
        </div>
        <form
          className="m-3 flex flex-row gap-1"
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
        <div className="mb-4 flex">
          <div className="w-1/2 flex-row mr-2">
            <form
              onSubmit={(e) => branchSubmitHandler(e)}
              className="m-3 flex flex-col gap-1 "
            >
              <div className="mb-4">
                <label htmlFor="page" className="block text-gray-700">
                  ページ数:
                </label>
                <select
                  id="page"
                  value={branchPage}
                  onChange={(e) => setBranchPage(parseInt(e.target.value))}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                >
                  {/* ページ数の選択肢を表示 */}
                  {[1, 2, 3, 4, 5, 10, 25, 50, 100].map((page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="perPage" className="block text-gray-700">
                  1ページあたりの表示件数:
                </label>
                <select
                  id="perPage"
                  value={branchPerPage}
                  onChange={(e) => setBranchPerPage(parseInt(e.target.value))}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                >
                  {/* 1ページあたりの表示件数の選択肢を表示 */}
                  {[1, 3, 5, 10, 20, 50].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-gray-700">
                  プロジェクトの名前
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={branchProjectName}
                  onChange={(e) => setBranchProjectName(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                />
              </div>
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg p-2.5"
              >
                ブランチ一覧
              </button>
            </form>
          </div>
          <div className="w-1/2 flex-row mr-2">
            <form
              onSubmit={(e) => mrSubmitHandler(e)}
              className="m-3 flex flex-col gap-1 "
            >
              <div className="mb-4">
                <label htmlFor="page" className="block text-gray-700">
                  ページ数:
                </label>
                <select
                  id="page"
                  value={mrPage}
                  onChange={(e) => setMrPage(parseInt(e.target.value))}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                >
                  {/* ページ数の選択肢を表示 */}
                  {[1, 2, 3, 4, 5, 10, 25, 50, 100].map((page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="perPage" className="block text-gray-700">
                  1ページあたりの表示件数:
                </label>
                <select
                  id="perPage"
                  value={mrPerPage}
                  onChange={(e) => setMrPerPage(parseInt(e.target.value))}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                >
                  {/* 1ページあたりの表示件数の選択肢を表示 */}
                  {[1, 3, 5, 10, 20, 50].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-gray-700">
                  プロジェクトの名前
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={mrProjectName}
                  onChange={(e) => setMrProjectName(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                />
              </div>
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg p-2.5"
              >
                MR一覧
              </button>
            </form>
          </div>
          <div className="w-1/2 flex-row mr-2">
            <form
              onSubmit={(e) => commitSubmitHandler(e)}
              className="m-3 flex flex-col gap-1 "
            >
              <div className="mb-4">
                <label htmlFor="page" className="block text-gray-700">
                  ページ数:
                </label>
                <select
                  id="page"
                  value={commitPage}
                  onChange={(e) => setCommitPage(parseInt(e.target.value))}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                >
                  {/* ページ数の選択肢を表示 */}
                  {[1, 2, 3, 4, 5, 10, 25, 50, 100].map((page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="perPage" className="block text-gray-700">
                  1ページあたりの表示件数:
                </label>
                <select
                  id="perPage"
                  value={commitPerPage}
                  onChange={(e) => setCommitPerPage(parseInt(e.target.value))}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                >
                  {/* 1ページあたりの表示件数の選択肢を表示 */}
                  {[1, 3, 5, 10, 20, 50].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-gray-700">
                  プロジェクトの名前
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={commitProjectName}
                  onChange={(e) => setCommitProjectName(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-gray-700">
                  ブランチの名前
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
                />
              </div>
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg p-2.5"
              >
                コミット一覧
              </button>
            </form>
          </div>
        </div>
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
                  "whitespace-pre-wrap break-all border bg-gray-50 border-gray-300 text-gray-900 rounded-lg p-2.5" +
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
