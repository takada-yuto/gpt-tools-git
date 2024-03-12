import { FunctionCall } from "@azure/openai/types/src"
import { createMergeRequests, getMergeRequests } from "./merge_request"
import { searchProjectId } from "./project"
import { listCommits, revertCommit } from "./commit"
import { createBranches, deleteBranches, listBranches } from "./branch"
import { searchGroupId } from "./group"
import { createFile, deleteFile, updateFile } from "./file"
import { Toast } from "../util/toast"

const functionMap: {
  [key: string]: (
    token: string,
    args: any,
    page: number,
    perPage: number
  ) => Promise<any>
} = {
  getMergeRequests: getMergeRequests,
  searchProjectId: searchProjectId,
  createMergeRequests: createMergeRequests,
  listCommits: listCommits,
  revertCommit: revertCommit,
  listBranches: listBranches,
  createBranches: createBranches,
  deleteBranches: deleteBranches,
  searchGroupId: searchGroupId,
  createFile: createFile,
  deleteFile: deleteFile,
  updateFile: updateFile,
}

export const callFunction = async (
  token: string,
  functionCall: FunctionCall,
  page: number,
  perPage: number
) => {
  const functionName = functionCall.name
  const functionArgs = functionCall.arguments

  if (functionName in functionMap) {
    const result = await functionMap[functionName](
      token,
      functionArgs,
      page,
      perPage
    )
    return result
  } else {
    throw new Error(`Unsupported function: ${functionName}`)
  }
}
