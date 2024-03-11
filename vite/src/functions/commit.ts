import { searchProjectId } from "./project"

const page = import.meta.env.VITE_DISPLAY_PAGE
const per_page = import.meta.env.VITE_DISPLAY_PER_PAGE
export const listCommits = async (token: string, _args: any) => {
  console.log("listCommitsが呼ばれました")
  const projectId = await searchProjectId(token, _args)
  const args = JSON.parse(_args)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/commits?private_token=${token}&page=${page}&per_page=${per_page}&ref_name=${args.branch}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const response = await fetch(url, { headers: headers })
  const responseData = await response.json()
  return JSON.stringify({ list_commits: responseData })
}

export const searchCommitId = async (token: string, _args: any) => {
  console.log("search_commit_idが呼ばれました")
  const projectId = await searchProjectId(token, _args)
  const args = JSON.parse(_args)
  const encodedCommitName = encodeURIComponent(args.commit_name)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/search?scope=commits&search=${encodedCommitName}&ref=${args.branch}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const response = await fetch(url, { headers: headers })
  const projectInfo = await response.json()

  if (projectInfo.length < 2) {
    return projectInfo[0]["id"]
  } else {
    return JSON.stringify({
      search_commit_id: `複数の検索結果がありました。${projectInfo}`,
    })
  }
}

export const revertCommit = async (token: string, _args: any) => {
  console.log("revert_commitが呼ばれました")
  const projectId = await searchProjectId(token, _args)
  const args = JSON.parse(_args)
  let lastSha: string
  if (args.sha) {
    lastSha = args.sha
  } else {
    const commitId = await searchCommitId(token, _args)
    lastSha = commitId
  }
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/commits/${lastSha}/revert`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const data = {
    branch: args.branch,
  }
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })
  return await JSON.stringify({ revert_commit: response.json() })
}
