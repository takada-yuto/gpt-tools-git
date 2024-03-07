import { searchProjectId } from "./project"

export const getMergeRequests = async (_args: any) => {
  const token = import.meta.env.VITE_PERSONAL_GROUP_TOKEN
  const page = import.meta.env.VITE_DISPLAY_PAGE
  const per_page = import.meta.env.VITE_DISPLAY_PER_PAGE
  const projectId = await searchProjectId(_args)
  const url = `${import.meta.env.VITE_GITLAB_URL}/projects/${projectId}/merge_requests?private_token=${token}&page=${page}&per_page=${per_page}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json"
  };
  const response = await fetch(url, { headers: headers, })
  const responseData = await response.json();
  return JSON.stringify({ "merge_request_info": responseData })
}

export const createMergeRequests = async (_args: any) => {
  const token = import.meta.env.VITE_PERSONAL_GROUP_TOKEN
  const page = import.meta.env.VITE_DISPLAY_PAGE
  const per_page = import.meta.env.VITE_DISPLAY_PER_PAGE
  const projectId = await searchProjectId(_args)
  const url = `${import.meta.env.VITE_GITLAB_URL}/projects/${projectId}/merge_requests?private_token=${token}&page=${page}&per_page=${per_page}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json"
  };
  const args = JSON.parse(_args)
  const data = {  
    "source_branch": args.source_branch,
    "target_branch": args.target_branch,
    "title": args.title,
    "description": args.description,
  }
  const response = await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(data) })
  const responseData = await response.json();
  return JSON.stringify({ "new_merge_request": responseData })
}