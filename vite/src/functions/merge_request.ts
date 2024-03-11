import { searchProjectId } from "./project"

export const getMergeRequests = async (
  token: string,
  _args: any,
  page: number,
  perPage: number
) => {
  const projectId = await searchProjectId(token, _args, page, perPage)
  const url = `${
    import.meta.env.VITE_GITLAB_URL
  }/projects/${projectId}/merge_requests?private_token=${token}&page=${page}&per_page=${perPage}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const response = await fetch(url, { headers: headers })
  const responseData = await response.json()
  return JSON.stringify({ merge_request_info: responseData })
}

export const createMergeRequests = async (
  token: string,
  _args: any,
  page: number,
  perPage: number
) => {
  const projectId = await searchProjectId(token, _args, page, perPage)
  const url = `${
    import.meta.env.VITE_GITLAB_URL
  }/projects/${projectId}/merge_requests?private_token=${token}&page=${page}&per_page=${perPage}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const args = JSON.parse(_args)
  const data = {
    source_branch: args.source_branch,
    target_branch: args.target_branch,
    title: args.title,
    description: args.description,
  }
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })
  const responseData = await response.json()
  return JSON.stringify({ new_merge_request: responseData })
}
