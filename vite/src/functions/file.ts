import { searchProjectId } from "./project"
import {
  AzureKeyCredential,
  ChatRequestMessage,
  GetChatCompletionsOptions,
  OpenAIClient,
  OpenAIClientOptions,
} from "@azure/openai"

export const createFile = async (
  token: string,
  _args: any,
  page: number,
  perPage: number
) => {
  console.log("createFileが呼ばれました")
  const projectId = await searchProjectId(token, _args, page, perPage)
  const args = JSON.parse(_args)
  const file_path = args.file_path.replace("/", "%2F")
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/files/${file_path}`
  console.log(args.file_path)
  console.log(url)
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const branch = args.branch.replace("/", "%2F")
  const data = {
    branch: branch,
    content: args.content,
    commit_message: args.commit_message,
  }
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })
  const responseData = response.text
  return JSON.stringify({ new_file: responseData })
}

export const deleteFile = async (
  token: string,
  _args: any,
  page: number,
  perPage: number
) => {
  console.log("deleteFileが呼ばれました")
  const projectId = await searchProjectId(token, _args, page, perPage)
  const args = JSON.parse(_args)
  const file_path = args.file_path.replace("/", "%2F")
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/files/${file_path}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const branch = args.branch.replace("/", "%2F")
  const data = {
    branch: branch,
    commit_message: args.commit_message,
  }
  const response = await fetch(url, {
    method: "DELETE",
    headers: headers,
    body: JSON.stringify(data),
  })
  const responseData = response.text
  return JSON.stringify({ delete_file: responseData })
}

export const updateFile = async (
  token: string,
  _args: any,
  page: number,
  perPage: number
) => {
  console.log("updateFileが呼ばれました")
  const clientOptions: OpenAIClientOptions = {
    apiVersion: "2023-12-01-preview",
  }

  const client = new OpenAIClient(
    import.meta.env.VITE_AZURE_URL,
    new AzureKeyCredential(import.meta.env.VITE_AZURE_API_KEY),
    clientOptions
  )
  // const deploymentId = 'gpt-4-turbo'
  const deploymentId = "gpt-35-turbo-1106"

  const options: GetChatCompletionsOptions = {
    tools: [
      {
        type: "function",
        function: {
          name: "getFileContent",
          description: "指定された文字列からファイルの内容を取得する",
          parameters: {
            type: "object",
            properties: {
              content: {
                type: "string",
                description: "ファイルのの内容",
              },
            },
            required: ["content"],
          },
        },
      },
    ],
  }
  const projectId = await searchProjectId(token, _args, page, perPage)
  const args = JSON.parse(_args)
  const file_path = args.file_path.replace("/", "%2F")
  const branch = args.branch.replace("/", "%2F")
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/files/${file_path}/raw?ref=${branch}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const GITresponse = await fetch(url, { method: "GET", headers: headers })
  const fileContent = GITresponse.text
  console.log(fileContent)
  const messages: ChatRequestMessage[] = [
    {
      role: "user",
      content: `「${fileContent}」の「${args.source_content}」の部分を「${args.target_content}」に書き換えてください。またその編集後の内容だけを文字列で返してください。`,
    },
  ]
  const GPTResponse = await client.getChatCompletions(deploymentId, messages)
  const firstReaponseContent = GPTResponse.choices[0].message?.content
  console.log(firstReaponseContent)
  const secondMessages: ChatRequestMessage[] = [
    {
      role: "user",
      content: `以下からファイルの内容と思われる箇所を抜き取ってください\n${firstReaponseContent}`,
    },
  ]
  const secondGPTResponse = await client.getChatCompletions(
    deploymentId,
    secondMessages,
    options
  )
  console.log(secondGPTResponse.choices[0])
  const tool_call = secondGPTResponse.choices[0].message?.toolCalls[0]
  const file_content_args: any = tool_call?.function!.arguments
  const file_content_arg = JSON.parse(file_content_args)
  console.log(file_content_arg)
  const file_content_file_path = file_content_arg.file_path.replace("/", "%2F")
  const second_url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/files/${file_content_file_path}`
  const second_branch = args.branch.replace("/", "%2F")
  const second_data = {
    branch: second_branch,
    content: file_content_arg.content,
    commit_message: args.commit_message,
  }
  const secondGITresponse = await fetch(second_url, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(second_data),
  })
  return JSON.stringify({ update_file: secondGITresponse.json() })
}
