import { searchProjectId } from "./project";

const token = import.meta.env.VITE_PERSONAL_GROUP_TOKEN
const page = import.meta.env.VITE_DISPLAY_PAGE
const per_page = import.meta.env.VITE_DISPLAY_PER_PAGE

export const listBranches = async(_args: any) => {
  console.log("list_branchesが呼ばれました");
  const projectId = await searchProjectId(_args)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/branches?page=${page}&per_page=${per_page}`;
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json"
  };
  const response = await fetch(url, { headers: headers })
  const responseData = await response.json();
  return JSON.stringify({ "search_commit_id": responseData })
}

export const createBranches = async(_args: any) => {
  console.log("create_branchesが呼ばれました");
  const projectId = await searchProjectId(_args)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/branches`;
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json"
  };
  const args = JSON.parse(_args)
  const data = {  
    "branch": args.new_branch,
    "ref": args.source_bransh,
  }
  console.log(data)
  const response = await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(data) })
  console.log(response)
  console.log(response.text)
  const responseData = await response.json();
  return JSON.stringify({ "new_branch": responseData })
}

export const deleteBranches = async(_args: any) => {
  console.log("delete_branchesが呼ばれました");
  const projectId = await searchProjectId(_args)
  const args = JSON.parse(_args)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/branches/${args.delete_branch}`;
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json"
  };
  const response = await fetch(url, { method: 'DELETE', headers: headers })
  return JSON.stringify({ "delete_branche": response.text })
}