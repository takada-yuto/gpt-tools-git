import {
  OpenAIClient,
  AzureKeyCredential,
  GetChatCompletionsOptions,
  ChatRequestMessage,
  FunctionCall,
} from "@azure/openai"
import { OpenAIClientOptions } from "@azure/openai/types/src"
import { Toast } from "../util/toast"

const clientOptions: OpenAIClientOptions = { apiVersion: "2023-12-01-preview" }

const client = new OpenAIClient(
  import.meta.env.VITE_AZURE_URL,
  new AzureKeyCredential(import.meta.env.VITE_AZURE_API_KEY),
  clientOptions
)
const deploymentId = "gpt-4-turbo"

export const searchProjectId = async (
  token: string,
  _args: any,
  page: number,
  perPage: number
) => {
  console.log("searchProjectIdが呼ばれました")
  console.log(_args)
  const args = JSON.parse(_args)
  const projectName = args.project_name
  const getId = async (_args: any) => {
    const args = JSON.parse(_args.arguments)
    if (args.name === projectName) {
      return args.id
    }
  }
  const options: GetChatCompletionsOptions = {
    tools: [
      {
        type: "function",
        function: {
          name: "getId",
          description: "指定されたdataの中からidとnameを取得する",
          parameters: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "id (例:11、1754、56)",
              },
              name: {
                type: "string",
                description:
                  "プロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)",
              },
            },
            required: ["id", "name"],
          },
        },
      },
    ],
  }
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/groups/465/search?scope=projects&search=${projectName}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const response = await fetch(url, { headers: headers })
  const projectInfo = await response.json()
  if (projectInfo.length < 2) {
    if (projectInfo[0]) {
      if (!projectInfo[0]) {
        Toast.fire({
          title: "指定されたプロジェクトが見つかりませんでした",
          icon: "warning",
        })
        throw new Error("エラー")
      }
      return projectInfo[0].id
    } else {
    }
  } else {
    const content = `project_name: ${projectName}, data: ${JSON.stringify(
      projectInfo
    )}`
    const message: ChatRequestMessage[] = [{ role: "user", content: content }]
    const response = await client.getChatCompletions(
      deploymentId,
      message,
      options
    )
    const toolCalls = response.choices[0].message!.toolCalls
    let projectId = ""
    for (const tool_call of toolCalls) {
      if (tool_call.type === "function") {
        const args: FunctionCall = tool_call.function
        projectId = await getId(args)
        return projectId
      } else {
        throw new Error("関数は呼び出されませんでした")
      }
    }
  }
}
