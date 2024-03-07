export const searchProjectId = async(_args: any) => {
  console.log("searchProjectIdが呼ばれました");
  const args = JSON.parse(_args)
  const token = import.meta.env.VITE_PERSONAL_GROUP_TOKEN
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/groups/1741/search?scope=projects&search=${args.project_name}`;
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json"
  };
  const response = await fetch(url, { headers: headers, })
  const projectInfo = await response.json();
  console.log(response)
  console.log(projectInfo)
  if (projectInfo.length < 2) {
      return projectInfo[0].id;
  } else {
      console.log(`複数の検索結果がありました。${projectInfo}`);
      throw new Error("複数の検索結果がありました");
  }
}
