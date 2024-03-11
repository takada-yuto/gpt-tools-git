import { searchProjectId } from "./project"
import {
  AzureKeyCredential,
  ChatRequestMessage,
  GetChatCompletionsOptions,
  OpenAIClient,
  OpenAIClientOptions,
} from "@azure/openai"

export const createFile = async (token: string, _args: any) => {
  console.log("createFileが呼ばれました")
  const projectId = await searchProjectId(token, _args)
  const args = JSON.parse(_args)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/files/${args.file_path}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  // const utf8Encoder = new TextEncoder();
  // const encodedCommitMessage = utf8Encoder.encode(args.commit_message);
  console.log(_args)
  console.log(args.commit_message)
  // console.log(encodedCommitMessage)
  const data = {
    branch: args.branch,
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

export const deleteFile = async (token: string, _args: any) => {
  console.log("deleteFileが呼ばれました")
  const projectId = await searchProjectId(token, _args)
  const args = JSON.parse(_args)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/files/${args.file_path}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const data = {
    branch: args.branch,
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

export const updateFile = async (token: string, _args: any) => {
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
  const projectId = await searchProjectId(token, _args)
  const args = JSON.parse(_args)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/files/${args.file_path}/raw?ref=${args.branch}`
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
  const second_url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/files/${args.file_path}`
  const second_data = {
    branch: args.branch,
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
