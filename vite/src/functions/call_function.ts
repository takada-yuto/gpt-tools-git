import { FunctionCall } from "@azure/openai/types/src"
import { createMergeRequests, getMergeRequests } from "./merge_request"
import { searchProjectId } from "./project"
import { listCommits, revertCommit } from "./commit"
import { createBranches, deleteBranches, listBranches } from "./branch"
import { searchGroupId } from "./group"
import { createFile, deleteFile, updateFile } from "./file"

const functionMap: {
  [key: string]: (token: string, args: any) => Promise<any>
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
  functionCall: FunctionCall
) => {
  const functionName = functionCall.name
  const functionArgs = functionCall.arguments

  if (functionName in functionMap) {
    const result = await functionMap[functionName](token, functionArgs)
    return result
  } else {
    throw new Error(`Unsupported function: ${functionName}`)
  }
}
