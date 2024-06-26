import { Toast } from "../util/toast"

export const searchGroupId = async (
  token: string,
  _args: any,
  page: number,
  perPage: number
) => {
  console.log("searchGroupIdが呼ばれました")
  const args = JSON.parse(_args)
  const url = `https://gitlab-system-dev.k-idea.jp/api/v4/groups?search=${args.group_name}`
  const headers = {
    "PRIVATE-TOKEN": token,
    "Content-Type": "application/json",
  }
  const response = await fetch(url, { headers: headers })
  const groupInfo = await response.json()
  console.log(response)
  console.log(groupInfo)
  if (groupInfo.length < 2) {
    if (!groupInfo[0]) {
      Toast.fire({
        title: "指定されたグループが見つかりませんでした",
        icon: "warning",
      })
      throw new Error("エラー")
    }
    return groupInfo[0].id
  } else {
    console.log(`複数の検索結果がありました。${groupInfo}`)
    return JSON.stringify({ merge_request_info: groupInfo })
  }
}
