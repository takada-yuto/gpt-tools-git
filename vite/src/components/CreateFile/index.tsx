import { Dispatch, FC, SetStateAction } from "react"

interface Props {
  setProjectName: Dispatch<SetStateAction<string>>
  setFileContent: Dispatch<SetStateAction<string>>
  setFilePath: Dispatch<SetStateAction<string>>
  setBranch: Dispatch<SetStateAction<string>>
  setCommitMessage: Dispatch<SetStateAction<string>>
  projectName: string
  fileContent: string
  filePath: string
  branch: string
  commitMessage: string
}
export const CreateFile: FC<Props> = ({
  setProjectName,
  setFileContent,
  setBranch,
  setFilePath,
  setCommitMessage,
  projectName,
  fileContent,
  filePath,
  branch,
  commitMessage,
}) => {
  return (
    <>
      <div className="mb-4">
        <label htmlFor="projectName" className="block text-gray-700">
          プロジェクトの名前
        </label>
        <input
          type="text"
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="filePath" className="block text-gray-700">
          ファイルパス
        </label>
        <input
          type="text"
          id="filePath"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="branch" className="block text-gray-700">
          ブランチ名
        </label>
        <input
          type="text"
          id="branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="commitMessage" className="block text-gray-700">
          コミットメッセージ
        </label>
        <input
          type="text"
          id="commitMessage"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="fileContent" className="block text-gray-700">
          ファイルの内容
        </label>
        <textarea
          id="fileContent"
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
          rows={5}
        ></textarea>
      </div>
    </>
  )
}
