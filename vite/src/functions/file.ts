import { searchProjectId } from "./project";

export const createFile = async(token: string, _args: any) => {
  console.log("createFileが呼ばれました");
  const projectId = await searchProjectId(token, _args)
  const args = JSON.parse(_args)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/files/${args.file_path}`;
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json"
  };
  const data = {  
    "branch": args.branch,
    "content": args.content,
    "commit_message": args.commit_message,
  }
  const response = await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(data) })
  const responseData = response.text;
  return JSON.stringify({ "new_file": responseData })
}

export const deleteFile = async(token: string, _args: any) => {
  console.log("deleteFileが呼ばれました");
  const projectId = await searchProjectId(token, _args)
  const args = JSON.parse(_args)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/projects/${projectId}/repository/files/${args.file_path}`;
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json"
  };
  const data = {  
    "branch": args.branch,
    "commit_message": args.commit_message,
  }
  const response = await fetch(url, { method: 'DELETE', headers: headers, body: JSON.stringify(data) })
  const responseData = response.text;
  return JSON.stringify({ "delete_file": responseData })
}