import {
  OpenAIClient,
  AzureKeyCredential,
  GetChatCompletionsOptions,
  ChatRequestMessage,
} from '@azure/openai'
import { OpenAIClientOptions } from '@azure/openai/types/src'

const clientOptions: OpenAIClientOptions = { apiVersion: "2023-12-01-preview" }

const client = new OpenAIClient(
  import.meta.env.VITE_AZURE_URL,
  new AzureKeyCredential(import.meta.env.VITE_AZURE_API_KEY),
  clientOptions
)
const deploymentId = 'gpt-4-turbo'

const options: GetChatCompletionsOptions = { 
  tools: [
    {
      type: 'function',
      function: 
        {
          name: 'getId',
          description: '指定されたdataの中からnameがproject_nameと一致するidとnameを取得する',
          parameters: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'id (例:11、1754、56)',
              },
              name: {
                type: 'string',
                description: 'プロジェクトの名前 (例:chat app、AI-Brid、saikontan-bot、image-post-app)',
              },
            },
            required: ['id', 'name'],
          },
        },
    },
  ]
}
export const searchProjectId = async(token: string, _args: any) => {
  console.log("searchProjectIdが呼ばれました");
  const args = JSON.parse(_args)
  const projectName = args.project_name
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/groups/1862/search?scope=projects&search=${projectName}`;
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json"
  };
  const response = await fetch(url, { headers: headers, })
  const projectInfo = await response.json();
  if (projectInfo.length < 2) {
      return projectInfo[0].id;
  } else {
      const content = `project_name: ${projectName}, data: ${JSON.stringify(projectInfo)}`;
      const message: ChatRequestMessage[] = [
        { role: 'user', content: content },
      ]
      const response = await client.getChatCompletions(
        deploymentId,
        message,
        options,
      )
      const toolCalls = response.choices[0].message!.toolCalls
      let projectId = ''
      for (const toolCall of toolCalls) {
          const functionArguments = JSON.parse(toolCall.function.arguments);
          if (functionArguments.name === projectName) {
            projectId = functionArguments.id;
          } else {
            throw Error("idないや")
          }
      }
      return projectId
  }
}
