import { searchProjectId } from "./project"

export const listBranches = async (
  token: string,
  _args: any,
  page: number,
  perPage: number
) => {
  console.log("list_branchesが呼ばれました")
  const projectId = await searchProjectId(token, _args, page, perPage)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/branches?page=${page}&per_page=${perPage}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const response = await fetch(url, { headers: headers })
  const responseData = await response.json()
  return JSON.stringify({ search_commit_id: responseData })
}

export const createBranches = async (
  token: string,
  _args: any,
  page: number,
  perPage: number
) => {
  console.log("create_branchesが呼ばれました")
  const projectId = await searchProjectId(token, _args, page, perPage)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/branches`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const args = JSON.parse(_args)
  const new_branch = args.new_branch.replace("/", "%2F")
  const source_bransh = args.source_bransh.replace("/", "%2F")
  const data = {
    branch: new_branch,
    ref: source_bransh,
  }
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })
  const responseData = await response.json()
  return JSON.stringify({ new_branch: responseData })
}

export const deleteBranches = async (
  token: string,
  _args: any,
  page: number,
  perPage: number
) => {
  console.log("delete_branchesが呼ばれました")
  const projectId = await searchProjectId(token, _args, page, perPage)
  const args = JSON.parse(_args)
  const delete_branch = args.delete_branch.replace("/", "%2F")
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/branches/${delete_branch}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const response = await fetch(url, { method: "DELETE", headers: headers })
  return JSON.stringify({ delete_branche: response.text })
}
